const { REST, Routes } =require('discord.js');

const commands = [
  {
    name: 'me',
    description: 'tells about user information',
  },
];
const rest = new REST({ version: '10' }).setToken(process.env.BOT_TOKEN);
async function refreshCommands() {
try {
    console.log('Started refreshing application (/) commands.');
  
    await rest.put(Routes.applicationCommands('1230486555945205870'), { body: commands });
  
    console.log('Successfully reloaded application (/) commands.');
  } catch (error) {
    console.error(error);
  }
}
refreshCommands();