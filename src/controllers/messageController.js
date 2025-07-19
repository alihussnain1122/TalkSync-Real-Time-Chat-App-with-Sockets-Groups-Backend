import Message from '../models/messageModel.js';
import Chat from '../models/chatModel.js';

export const sendMessage= async(req, res)=>{
    const {content, chatId, attachments}= req.body;
    if((!content && !attachments) || !chatId){
        return res.status(400).json({message: "Missing content/attachments and chatId"});
    }
    try{
        let message= await Message.create({
            sender: req.user._id,
            content: content || '',
            chat: chatId,
            attachments: attachments || []
        });
        message = await message.populate("sender", "name email");
        message= await message.populate("chat");
        message= await message.populate({
            path: "chat.users",
            select: "name email"
        });

        await Chat.findByIdAndUpdate(chatId,{ latestMessage: message});
        return res.status(200).json(message);

    }
    catch(err){
        return res.status(500).json({message: err.message})
    }
}

//Get all message of chat
export const getMessages = async (req, res) => {
  const { chatId } = req.params;

  try {
    const messages = await Message.find({ chat: chatId })
      .populate("sender", "name email")
      .populate("chat");

    res.status(200).json(messages);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
