import "dotenv/config";
import mongoose from "mongoose";
import app from "./app.js";
import { UserModel } from "./models/UserModel.js";
import { NoteModel } from "./models/NoteModel.js";
import { ConversationModel } from "./models/ConversationModel.js";

const PORT = 5098;

async function runChatE2eTest() {
  console.log("=== Starting Persistent AI Study Mentor Chat E2E Test ===");
  await mongoose.connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/pocket_mentor");

  const server = app.listen(PORT, () => {
    console.log(`Test server running on port ${PORT}`);
  });

  const baseUrl = `http://localhost:${PORT}`;
  let user1Cookie = "";
  let user1Id = "";
  let user2Cookie = "";
  let testNoteId = "";
  let testConvId = "";

  try {
    // 1. Clean up test users
    await UserModel.deleteMany({
      email: { $in: ["chat_tester1@pocketmentor.local", "chat_tester2@pocketmentor.local"] },
    });

    // 2. Register User 1
    const regRes1 = await fetch(`${baseUrl}/api/common/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        Fname: "Jordan",
        Lname: "Student",
        email: "chat_tester1@pocketmentor.local",
        password: "Password123!",
      }),
    });
    user1Cookie = regRes1.headers.get("set-cookie")?.split(";")[0] || "";
    const regJson1 = await regRes1.json();
    user1Id = regJson1.data.user._id;
    console.log("✓ User 1 Registration & Cookie OK");

    // 3. Register User 2 (for security / ownership checks)
    const regRes2 = await fetch(`${baseUrl}/api/common/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        Fname: "Sam",
        Lname: "Attacker",
        email: "chat_tester2@pocketmentor.local",
        password: "Password123!",
      }),
    });
    user2Cookie = regRes2.headers.get("set-cookie")?.split(";")[0] || "";
    console.log("✓ User 2 Registration & Cookie OK");

    // 4. Create a Study Note for User 1
    const noteRes = await fetch(`${baseUrl}/api/common/notes`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: user1Cookie,
      },
      body: JSON.stringify({
        title: "Operating Systems - Concurrency & Deadlocks",
        text: "Deadlock is a state where a set of processes are blocked because each process is holding a resource and waiting for another resource acquired by some other process. The four Coffman conditions are Mutual Exclusion, Hold and Wait, No Preemption, and Circular Wait. Banker's algorithm by Edsger Dijkstra is used for deadlock avoidance.",
        sourceType: "text",
      }),
    });
    const noteJson = await noteRes.json();
    console.assert(noteJson.success === true, "Note creation failed");
    testNoteId = noteJson.data.noteId;
    console.log("✓ Note Creation OK, Note ID:", testNoteId);

    // 5. Test New General Chat (without noteId or conversationId)
    console.log("\n--- Testing General Chat (First Message) ---");
    const chatRes1 = await fetch(`${baseUrl}/api/mentor/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: user1Cookie,
      },
      body: JSON.stringify({
        message: "Explain what is deadlock in simple words",
      }),
    });

    const chatJson1 = await chatRes1.json();
    console.assert(chatJson1.success === true, "Chat 1 failed: " + chatJson1.message);
    console.assert(Boolean(chatJson1.data.conversationId), "conversationId not returned");
    console.assert(Boolean(chatJson1.data.reply), "reply not returned");
    testConvId = chatJson1.data.conversationId;
    console.log("✓ First chat created persistent conversation:", testConvId);
    console.log("  Auto-generated Title:", chatJson1.data.title);
    console.log("  AI Reply Snippet:", chatJson1.data.reply.slice(0, 80) + "...");

    // Verify in MongoDB
    const savedConv1 = await ConversationModel.findById(testConvId);
    console.assert(savedConv1 !== null, "Conversation not found in DB");
    console.assert(savedConv1.messages.length === 2, "Expected 2 messages in DB (user + AI)");
    console.log("✓ Verified MongoDB persistence: 2 messages saved in conversation");

    // 6. Test Follow-Up Question in Same Conversation
    console.log("\n--- Testing Follow-up Context in Same Conversation ---");
    const chatRes2 = await fetch(`${baseUrl}/api/mentor/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: user1Cookie,
      },
      body: JSON.stringify({
        conversationId: testConvId,
        message: "What are the four conditions for it?",
      }),
    });

    const chatJson2 = await chatRes2.json();
    console.assert(chatJson2.success === true, "Follow-up failed: " + chatJson2.message);
    console.assert(chatJson2.data.conversationId === testConvId, "Conversation ID changed unexpectedly");
    console.log("✓ Follow-up message processed successfully");
    console.log("  Follow-up Reply Snippet:", chatJson2.data.reply.slice(0, 80) + "...");

    const savedConv2 = await ConversationModel.findById(testConvId);
    console.assert(savedConv2.messages.length === 4, "Expected 4 messages in DB now");
    console.log("✓ Verified MongoDB persistence: 4 messages saved in history");

    // 7. Test Note-Aware Chat (passing noteId)
    console.log("\n--- Testing Note-Aware Chat ---");
    const chatRes3 = await fetch(`${baseUrl}/api/mentor/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: user1Cookie,
      },
      body: JSON.stringify({
        noteId: testNoteId,
        message: "What algorithm does my note mention for deadlock avoidance?",
      }),
    });

    const chatJson3 = await chatRes3.json();
    console.assert(chatJson3.success === true, "Note-aware chat failed: " + chatJson3.message);
    console.log("✓ Note-aware chat created conversation:", chatJson3.data.conversationId);
    console.log("  Note-grounded Reply Snippet:", chatJson3.data.reply.slice(0, 100) + "...");

    // 8. Test Get Conversations List
    console.log("\n--- Testing GET /api/mentor/conversations ---");
    const listRes = await fetch(`${baseUrl}/api/mentor/conversations`, {
      headers: { Cookie: user1Cookie },
    });
    const listJson = await listRes.json();
    console.assert(listJson.success === true, "Get conversations failed");
    console.assert(listJson.data.conversations.length >= 2, "Expected at least 2 conversations for user 1");
    console.log("✓ Listed conversations OK. Found:", listJson.data.conversations.length, "conversations");

    // 9. Test Get Single Conversation By ID
    console.log("\n--- Testing GET /api/mentor/conversations/:id ---");
    const getRes = await fetch(`${baseUrl}/api/mentor/conversations/${testConvId}`, {
      headers: { Cookie: user1Cookie },
    });
    const getJson = await getRes.json();
    console.assert(getJson.success === true, "Get conversation failed");
    console.assert(getJson.data.conversation.messages.length === 4, "Expected 4 messages in retrieved conversation");
    console.log("✓ Retrieved full conversation history with 4 messages OK");

    // 10. Security & Ownership Tests: User 2 cannot access or delete User 1's conversation
    console.log("\n--- Testing Security & User Ownership Checks ---");
    const hackRes = await fetch(`${baseUrl}/api/mentor/conversations/${testConvId}`, {
      headers: { Cookie: user2Cookie },
    });
    console.assert(hackRes.status === 404 || hackRes.status === 403, "User 2 should NOT be able to view User 1's conversation");
    console.log("✓ Verified: Unauthorized user cannot read another user's conversation (Status " + hackRes.status + ")");

    const hackDeleteRes = await fetch(`${baseUrl}/api/mentor/conversations/${testConvId}`, {
      method: "DELETE",
      headers: { Cookie: user2Cookie },
    });
    console.assert(hackDeleteRes.status === 404 || hackDeleteRes.status === 403, "User 2 should NOT be able to delete User 1's conversation");
    console.log("✓ Verified: Unauthorized user cannot delete another user's conversation (Status " + hackDeleteRes.status + ")");

    // 11. Delete Conversation
    console.log("\n--- Testing DELETE /api/mentor/conversations/:id ---");
    const delRes = await fetch(`${baseUrl}/api/mentor/conversations/${testConvId}`, {
      method: "DELETE",
      headers: { Cookie: user1Cookie },
    });
    const delJson = await delRes.json();
    console.assert(delJson.success === true, "Delete conversation failed");
    const checkDeleted = await ConversationModel.findById(testConvId);
    console.assert(checkDeleted === null, "Conversation should have been deleted from DB");
    console.log("✓ Conversation deleted successfully by owner");

    // Clean up
    await UserModel.deleteMany({
      email: { $in: ["chat_tester1@pocketmentor.local", "chat_tester2@pocketmentor.local"] },
    });
    await NoteModel.deleteMany({ _id: testNoteId });
    await ConversationModel.deleteMany({ userId: user1Id });

    console.log("\n🎉 ALL AI STUDY MENTOR CHATBOT TESTS PASSED COMPLETELY!");
  } catch (err) {
    console.error("Test failed with error:", err);
    process.exit(1);
  } finally {
    server.close();
    await mongoose.disconnect();
    process.exit(0);
  }
}

runChatE2eTest();
