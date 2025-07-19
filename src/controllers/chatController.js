import User from '../models/userModel.js';
import chatModel from '../models/chatModel.js';
import Chat from '../models/chatModel.js';

//Create chat
export const createChat= async(req, res)=>{
    const {userId}= req.body;
    if(!userId){
        return res.status(400).send('User ID is required');
    }
     const existingChat= await chatModel.findOne({
        isGroupChat: false,
        users: { $all: [req.user._id, userId]},
     }).populate("users", "-password");

     if(existingChat){
        return res.status(200).json(existingChat);
     }
     try{
        const chat= await Chat.create({
            chatName: "sender",
            isGroupChat: false,
            users: [req.user._id, userId],
        });

        const fullChat = await Chat.findById(chat._id).populate("users", "-password");
        return res.status(201).json(fullChat);
     }
        catch (error) {
            return res.status(500).json({ message: error.message });
        }

}

//Fetch all chats
export const fetchChats= async(req, res)=>{
    try{
        const chats= await Chat.find({users: req.user._id})
        .populate("users","-password")
        .populate("groupAdmin", "-password")
        .populate({
            path: "latestMessage",
            populate: {
                path: "sender",
                select: "name email"
            }
        })
        .sort({updatedAt: -1});
        return res.status(200).json(chats);
    }
    catch(err){
        return res.status(500).json({message: err.message});
    }
}

//Create group chat
export const createGroupChat = async (req, res) => {
    const { users, chatName } = req.body;
    
    if (!users || !chatName) {
        return res.status(400).json({ message: "Please provide users and chat name" });
    }
    
    if (users.length < 2) {
        return res.status(400).json({ message: "More than 2 users are required to form a group chat" });
    }
    
    try {
        // Add the current user to the group
        const groupUsers = [req.user._id, ...users];
        
        const groupChat = await Chat.create({
            chatName: chatName.trim(),
            users: groupUsers,
            isGroupChat: true,
            groupAdmin: req.user._id,
        });
        
        const fullGroupChat = await Chat.findById(groupChat._id)
            .populate("users", "-password")
            .populate("groupAdmin", "-password");
            
        return res.status(201).json(fullGroupChat);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

//Rename group
export const renameGroup = async (req, res) => {
    const { chatId, chatName } = req.body;
    
    if (!chatId || !chatName) {
        return res.status(400).json({ message: "Chat ID and new name are required" });
    }
    
    try {
        const updatedChat = await Chat.findByIdAndUpdate(
            chatId,
            { chatName: chatName.trim() },
            { new: true }
        )
        .populate("users", "-password")
        .populate("groupAdmin", "-password");
        
        if (!updatedChat) {
            return res.status(404).json({ message: "Chat not found" });
        }
        
        return res.status(200).json(updatedChat);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

//Add user to group
export const addToGroup = async (req, res) => {
    const { chatId, userId } = req.body;
    
    if (!chatId || !userId) {
        return res.status(400).json({ message: "Chat ID and User ID are required" });
    }
    
    try {
        const chat = await Chat.findById(chatId);
        
        if (!chat) {
            return res.status(404).json({ message: "Chat not found" });
        }
        
        if (!chat.isGroupChat) {
            return res.status(400).json({ message: "This is not a group chat" });
        }
        
        // Check if user is already in the group
        if (chat.users.includes(userId)) {
            return res.status(400).json({ message: "User is already in the group" });
        }
        
        const updatedChat = await Chat.findByIdAndUpdate(
            chatId,
            { $push: { users: userId } },
            { new: true }
        )
        .populate("users", "-password")
        .populate("groupAdmin", "-password");
        
        return res.status(200).json(updatedChat);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

//Remove user from group
export const removeFromGroup = async (req, res) => {
    const { chatId, userId } = req.body;
    
    if (!chatId || !userId) {
        return res.status(400).json({ message: "Chat ID and User ID are required" });
    }
    
    try {
        const chat = await Chat.findById(chatId);
        
        if (!chat) {
            return res.status(404).json({ message: "Chat not found" });
        }
        
        if (!chat.isGroupChat) {
            return res.status(400).json({ message: "This is not a group chat" });
        }
        
        // Check if user is in the group
        if (!chat.users.includes(userId)) {
            return res.status(400).json({ message: "User is not in the group" });
        }
        
        const updatedChat = await Chat.findByIdAndUpdate(
            chatId,
            { $pull: { users: userId } },
            { new: true }
        )
        .populate("users", "-password")
        .populate("groupAdmin", "-password");
        
        return res.status(200).json(updatedChat);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};