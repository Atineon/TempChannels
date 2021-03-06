///////////////////
// TempChannels™ //
///////////////////

const Discord = require("discord.js");
const client = new Discord.Client();
const fs = require("fs");
const {autochannel_ncchannel, autochannel_category, prefix} = require("./config.json");


client.commands = new Discord.Collection();
const commandFiles = fs.readdirSync("./commands").filter(file => file.endsWith(".js"));
for(const file of commandFiles){
    const command = require(`./commands/${file}`);
    client.commands.set(command.name, command);
};


client.on("ready", () => {
    const status = [
        `${client.guilds.cache.size} servers | tc/help`,
        `${client.channels.cache.size} channels | tc/help`,
        `${client.users.cache.size} users | tc/help`,
        "New update soon..."
    ];
    var x = 0;


    setInterval(() => {
        client.user.setActivity(status[x], {type: "WATCHING"});
        x = x+1;
        if(x == 4){
            x = 0;
        }
    }, 30000);
    console.log(client.guilds.cache.map(r => `name : ${r.name} | members : ${r.memberCount}`));
    console.log(`INFO: Online on ${client.guilds.cache.size} servers`);
})


client.on("message", message => {
    const args = message.content.slice(prefix.length).split(/ +/);
    const command = args.shift().toLowerCase();
    

    if(message.author.bot){
        return;
    }

    if(!message.content.startsWith(prefix) || message.author.bot){
        return;
    }

    if(!client.commands.has(command)){
        return;
    }

    try{
        client.commands.get(command).execute(message, args);
    }

    catch(error){
        message.channel.send("Error : The command was not executed successfully.");
        console.log(`WARNING: ${message.author.username} have found a bug in the system !!! (${command} command)`);
        console.error(error);
    }
})

client.on("voiceStateUpdate", (oldState, newState) => {
    global.joined_user = newState.member;
    global.new_voicechannel_name = newState.channel && newState.channel.name;
    var joined_username = newState.member.user.username;
    var old_voicechannel_name = oldState.channel && oldState.channel.name;
    var server = newState.guild.name;

    if(new_voicechannel_name == autochannel_ncchannel && !newState.guild.channels.cache.find(channel => channel.name === oldState.member.user.username)){
        newState.guild.channels.create(joined_username, {

            type: "voice",
            parent: newState.guild.channels.cache.find(channel => channel.name === autochannel_category && channel.type == "category")

        });
        console.log(`INFO: ${joined_username} created a channel on ${server}.`);
    }
    if(!new_voicechannel_name && old_voicechannel_name){
        var oldsize = oldState.channel.members.size;
        if(oldsize > 0 && oldState.guild.channels.cache.find(channel => channel.name === oldState.member.user.username)){
            var fetchedUser = oldState.channel.members.first().user.username;
            var fetchedChannel = oldState.guild.channels.cache.find(channel => channel.name === oldState.member.user.username);
            fetchedChannel.setName(`${fetchedUser}`);
            console.log(`INFO: ${joined_username}'s channel has changed to ${fetchedUser} on ${server}.`);
        }
        else if(oldState.guild.channels.cache.find(channel => channel.name === oldState.member.user.username))
        {
            var fetchedChannel = oldState.guild.channels.cache.find(channel => channel.name === oldState.member.user.username);
            fetchedChannel.delete();
            console.log(`INFO: ${joined_username}'s channel has been deleted on ${server}.`);
        }
    }
    if(new_voicechannel_name && old_voicechannel_name && old_voicechannel_name == oldState.member.user.username){
        var oldsize = oldState.channel.members.size;
        if(oldsize > 0 && new_voicechannel_name != old_voicechannel_name){
            var fetchedChannel = oldState.guild.channels.cache.find(channel => channel.name === oldState.member.user.username);
            var fetchedUser = oldState.channel.members.first().user.username;
            fetchedChannel.setName(`${fetchedUser}`);
            console.log(`INFO: ${joined_username}'s channel has changed to ${fetchedUser} on ${server}.`);
        }
        else if(new_voicechannel_name != old_voicechannel_name && old_voicechannel_name != autochannel_ncchannel){
            var fetchedChannel = oldState.guild.channels.cache.find(channel => channel.name === oldState.member.user.username);
            fetchedChannel.delete();
            console.log(`INFO: ${joined_username}'s channel has been deleted on ${server}.`);
        }
    }
})

client.on("channelCreate", channel => {
    var created_channel = channel.id;

    if(typeof new_voicechannel_name === "undefined" || new_voicechannel_name === null){
        return;
    }

    if(new_voicechannel_name == autochannel_ncchannel){
        joined_user.voice.setChannel(created_channel);
    }
})

client.login(process.env.TOKEN);
