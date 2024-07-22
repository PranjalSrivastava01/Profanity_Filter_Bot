const { Client, GatewayIntentBits } = require("discord.js");
require('dotenv').config();
// Function to kick a user by username
async function kickUser(client, username) {
  try {
    // Ensure the client is logged in and ready
    await client.login(
      process.env.BOT_TOKEN
    ); // Replace with your actual bot token (keep this confidential)

    // Find the user by username
    const user = client.users.cache.find((user) => user.username === username);

    // If the user is found, kick them from the guild
    if (user) {
      console.log(user);
      const guild = client.guilds.cache.first(); // Assuming it's the first guild the bot is in
      const member = guild.members.cache.get(user.id);
      if (member) {
        await member.kick();
        console.log(`Kicked user: ${username}`);
      } else {
        console.log(`User ${username} is not a member of the guild`);
      }
    } else {
      console.log(`User ${username} not found`);
    }

    // Logout from Discord (optional, can be left out for continuous operation)
    await client.destroy();
  } catch (error) {
    console.error("Error kicking user:", error);
  }
}

// You can optionally export the function for use in other files:
module.exports = kickUser;
