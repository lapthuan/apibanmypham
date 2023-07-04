const Introduce = require("../models/introduceFriendsModel");
const asyncHandler = require("express-async-handler");

const addIntroduce = asyncHandler(async (req, res) => {
    const { idIntroduce, idUser } = req.body
    try {
        const findIntroduce = await Introduce.find({ idUser: idUser, idIntroduce: idIntroduce })

        if (findIntroduce) {
            res.json({ msg: "Friends have been introduced" });
        } else {
            const newIntroduce = await Introduce.create(req.body);
            res.json({ msg: "Success", introduce: newIntroduce });
        }

    } catch (error) {
        throw new Error(error)
    }
})
const getAllIntroduce = asyncHandler(async (req, res) => {

    try {

        const getIntroduce = await Introduce.find({});
        res.json(getIntroduce);
    } catch (error) {
        throw new Error(error)
    }
})

const getAIntroduceIsUser = asyncHandler(async (req, res) => {
    const { id } = req.params;

    try {
        console.log(id);
        const getaIntroduce = await Introduce.find({ idIntroduce: id });
    
        res.json(getaIntroduce);
    } catch (error) {
        throw new Error(error)
    }
})

module.exports = {
    addIntroduce,
    getAllIntroduce,
    getAIntroduceIsUser
}