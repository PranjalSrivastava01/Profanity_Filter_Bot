const { Client, GatewayIntentBits } = require("discord.js");
const hasProfanity = require("./ProfanityAPI");
const kickUser = require("./kick");
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});
require("dotenv").config();
async function checkTextForProfanity(text, apikey) {
  try {
    const profanity = await hasProfanity(text, apikey);
    //  console.log(profanity)
    return profanity;
  } catch (error) {
    console.error("Error:", error);
  }
}
//create user function start
const userExists = async (userName) => {
  try {
    const res = await fetch(`https://profanity-filter-api-3.onrender.com/users/getUser/${userName}`, {
      method: "get",
      headers: {
        "Content-type": "application/json",
      },
    });
    const data = await res.json();
    console.log(data.length)
    return data.length!=0; // Check if data is not null
  } catch (error) {
    console.error("Error checking user existence:", error);
    return false; // Return false in case of error
  }
}

const createUser = async (userName, count) => {
  const exists = await userExists(userName);
  
  if (exists) {
    console.log("already exist");
    return;
  }
  const userData = {
    userName: userName,
    count: count,
  };
  console.log(userData);
  const res = await fetch("https://profanity-filter-api-3.onrender.com/users/addUser", {
    method: "post",
    headers: {
      "Content-type": "application/json",
    },
    body: JSON.stringify(userData),
  });

  const data = await res.json();
  console.log(data);
};
const updateUser = async (userName) => {
  const res = await fetch(`https://profanity-filter-api-3.onrender.com/users/getUser/${userName}`, {
    method: "get",
    headers: {
      "Content-type": "application/json",
    },
  });
  const data = await res.json();
  const newcount = data[0].count + 1;
  console.log(newcount)
  const res1 = await fetch(
    `https://profanity-filter-api-3.onrender.com/users/updateUser/${userName}`,
    {
      method: "put",
      headers: {
        "Content-type": "application/json",
      },
      body: JSON.stringify({userName:userName,count:newcount}),
    }
  );
  const updatedUserData = await res1.json();
  console.log("User count updated successfully:", updatedUserData);
};

const initializeUserData = async (userName) => {
    try {
      const res = await fetch(
        `https://profanity-filter-api-3.onrender.com/users/updateUser/${userName}`,
        {
          method: "put",
          headers: {
            "Content-type": "application/json",
          },
          body: JSON.stringify({userName:userName,count:0 }),
        }
      );
      const updatedUserData = await res.json();
      console.log("User count reset to 0:", updatedUserData);
    } catch (error) {
      console.error("Error initializing user data:", error);
    }
  };
  
//create user function end
const countVal = async (userName) => {
  const res = await fetch(`https://profanity-filter-api-3.onrender.com/users/getUser/${userName}`, {
    method: "get",
    headers: {
      "Content-type": "application/json",
    },
  });
  const data = await res.json();
  return data[0].count;
};
client.on("messageCreate", async (message) => {
  if (message.author.bot) return;
  const userName = message.author.username;
  let flag = false;
  try {
    const profanity = await checkTextForProfanity(
      message.content,
      process.env.API_KEY
    );
    flag = profanity;
    // console.log(flag);
  } catch (error) {
    console.error("Error checking for profanity:", error);
    return; // Exit the handler if an error occurs
  }

  if (flag) {
    const count = await countVal(userName)+1;
    // console.log(count);
    try {
      const exists = await userExists(userName);
      console.log(exists);
      if (exists) {
        await updateUser(userName);
        // console.log(process.env.COUNT_LIMIT);
        if (count >= process.env.COUNT_LIMIT) {
          await initializeUserData(userName);
          message.reply({
            content: `You have exceeded the limit of warnings,total warnings: ${count}`,
          });
          kickUser(client, userName);
          return;
        }
      }
    } catch (error) {
      console.error("Error handling user data:", error);
      // Handle the error or return an error message to the user
    }
    message.reply({
      content: `⚠️  Attention: Maintaining a respectful environment is essential. Continued use of inappropriate language may result getting kicked. Total warnings: ${count}`,
    });
  }
});

client.on("interactionCreate", (interaction) => {
  if (interaction.commandName == "me") {
    const user = interaction.user;
    const username = user.username;
    const discriminator = user.discriminator;
    const avatar = user.avatarURL();
    createUser(username, 0);
    // Example response based on user information
    interaction.reply(
      `Hello Welcome ${username} to the server !!!#${discriminator}! Your avatar: ${avatar}`
    );
  }
});
client.login(
 process.env.BOT_TOKEN
);
