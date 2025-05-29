const {
  User,
  WorkoutList,
  BodyPart,
  Equipment,
  Exercise,
} = require("../models");
const { sequelize } = require("../models");
const { generateContent } = require("../helpers/gemini.api");
const axios = require("axios"); // Untuk memanggil 3rd party AI API
const { GoogleGenAI } = require("@google/genai");

class WorkoutListController {
  static async createWorkoutList(req, res, next) {
    try {
      console.log('Creating workout list with data:', req.body);
      console.log('User ID:', req.user.id);
      const UserId = req.user.id;
      const { BodyPartId, equipmentIds, name: workoutListName } = req.body; // equipmentIds adalah array of id, maksimal 2

      if (!BodyPartId) {
        throw { name: "BadRequest", message: "BodyPartId is required" };
      }
      if (
        !equipmentIds ||
        !Array.isArray(equipmentIds) ||
        equipmentIds.length > 2
      ) {
        throw {
          name: "BadRequest",
          message: "equipmentIds must be an array with 0 to 2 items",
        };
      }

      // Validasi apakah BodyPartId ada
      const bodyPart = await BodyPart.findByPk(BodyPartId);
      if (!bodyPart) {
        throw { name: "NotFound", message: "Body part not found" };
      }

      // Validasi apakah equipmentIds ada
      const selectedEquipments = await Equipment.findAll({
        where: { id: equipmentIds },
      });
      if (selectedEquipments.length !== equipmentIds.length) {
        throw { name: "NotFound", message: "One or more equipments not found" };
      }

      // Buat WorkoutList
      const newWorkoutList = await WorkoutList.create({
        UserId,
        BodyPartId,
        name: workoutListName,
      });

      // Generate exercises menggunakan AI
      const equipmentNames = selectedEquipments.map((eq) => eq.name);
      console.log('About to call generateExercisesFromAI');
      const generatedExercises = await generateExercisesFromAI(
        equipmentNames,
        bodyPart.name
      );
      console.log('Generated exercises:', generatedExercises);

      if (!generatedExercises || generatedExercises.length === 0) {
        throw {
          name: "AIError",
          message: "Failed to generate exercises from AI",
        };
      }

      // Simpan exercises ke database dengan EquipmentId
      const exercisesToCreate = [];
      generatedExercises.forEach((ex, index) => {
        // Distribusikan equipment secara merata ke exercises
        const equipmentIndex = index % selectedEquipments.length;
        exercisesToCreate.push({
          ...ex,
          WorkoutListId: newWorkoutList.id,
          EquipmentId: selectedEquipments[equipmentIndex].id,
        });
      });

      await Exercise.bulkCreate(exercisesToCreate);

      // Ambil data lengkap untuk response
      const finalWorkoutList = await WorkoutList.findByPk(newWorkoutList.id, {
        include: [
          { model: User, attributes: ["id", "username", "email"] },
          { model: BodyPart, attributes: ["id", "name"] },
          // HAPUS include Equipment di level WorkoutList untuk menghindari konflik
          {
            model: Exercise,
            attributes: {
              exclude: ["WorkoutListId", "createdAt", "updatedAt"],
            },
            include: [{ model: Equipment, attributes: ["id", "name"] }],
          },
        ],
      });

      res.status(201).json(finalWorkoutList);
    } catch (error) {
      console.error('Error in createWorkoutList:', error);
      next(error);
    }
  }

  static async getAllWorkoutLists(req, res, next) {
    try {
      const UserId = req.user.id;
      const workoutLists = await WorkoutList.findAll({
        where: { UserId },
        include: [
          { model: BodyPart, attributes: ["id", "name"] },
          {
            model: Exercise,
            attributes: {
              exclude: ["EquipmentId", "WorkoutListId", "createdAt", "updatedAt"],
            },
            include: [
                {model: Equipment, attributes: ["name"]}
            ]

          },
        ],
        order: [["createdAt", "DESC"]],
      });
      res.status(200).json(workoutLists);
    } catch (error) {
      next(error);
    }
  }

  static async getWorkoutListById(req, res, next) {
    try {
      const { id } = req.params;
      const UserId = req.user.id;
  
      const workoutList = await WorkoutList.findOne({
        where: { id, UserId },
        // TAMBAHKAN createdAt dan updatedAt
        attributes: ["id", "UserId", "name", "createdAt", "updatedAt"],
        include: [
          {
            model: BodyPart,
            attributes: ["id", "name"],
          },
          {
            model: Exercise,
            attributes: {
              exclude: ["WorkoutListId", "createdAt", "updatedAt"],
            },
          },
        ],
      });

      if (!workoutList) {
        throw {
          name: "NotFound",
          message: "Workout list not found or you are not authorized",
        };
      }

      console.log("Exercises found:", workoutList.Exercises?.length);
      res.status(200).json(workoutList);
    } catch (error) {
      next(error);
    }
  }

  static async updateExerciseRepetitions(req, res, next) {
    // User hanya bisa mengupdate repetisi exercise di workout list miliknya
    try {
      const UserId = req.user.id;
      const { workoutListId, exerciseId } = req.params;
      const { sets, repetitions } = req.body; // Update untuk field baru

      if (!sets && !repetitions) {
        throw {
          name: "BadRequest",
          message: "Sets or repetitions are required",
        };
      }

      const workoutList = await WorkoutList.findOne({
        where: { id: workoutListId, UserId },
      });

      if (!workoutList) {
        throw {
          name: "NotFound",
          message: "Workout list not found or you are not authorized",
        };
      }

      const exercise = await Exercise.findOne({
        where: { id: exerciseId, WorkoutListId: workoutListId },
      });

      if (!exercise) {
        throw {
          name: "NotFound",
          message: "Exercise not found in this workout list",
        };
      }

      // Update field yang diberikan
      if (sets) exercise.sets = sets;
      if (repetitions) exercise.repetitions = repetitions;

      await exercise.save();

      res
        .status(200)
        .json({ message: "Exercise updated successfully", exercise });
    } catch (error) {
      next(error);
    }
  }

  static async deleteWorkoutList(req, res, next) {
    try {
      const UserId = req.user.id;
      const { id } = req.params;

      const workoutList = await WorkoutList.findOne({
        where: { id, UserId },
      });

      if (!workoutList) {
        throw {
          name: "NotFound",
          message: "Workout list not found or you are not authorized",
        };
      }

      // Hapus exercises terkait (cascade delete akan menangani ini otomatis)
      await Exercise.destroy({ where: { WorkoutListId: id } });

      // Hapus workout list
      await workoutList.destroy();

      res.status(200).json({ message: "Workout list deleted successfully" });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = WorkoutListController;

// Fungsi untuk generate exercises menggunakan AI
async function generateExercisesFromAI(equipmentNames, bodyPartName) {
  console.log(
    `AI Generation Triggered with Gemini: Equipments: ${equipmentNames.join(
      ", "
    )}, Body Part: ${bodyPartName}`
  );

  const equipmentList = equipmentNames.join(", ");

  const prompt = `You are a professional fitness trainer.
Create a list of 5 exercises to train the "${bodyPartName}" body part using the "${equipmentList}" equipment.
For each exercise, provide the following information in a strict JSON format:
1. "name": Name of the exercise (String)./n
2. "steps": Detailed steps to perform the exercise, use numbering bullet and each step separated by a newline (String)./n
3. "sets": Recommended number of sets (Integer)./n
4. "repetitions": Number of repetitions per set (Integer)./n
5. "youtubeUrl": Youtube query URL for a video reference corresponding to the exercise name (String).

Ensure the output is a valid JSON array containing 5 exercise objects. Do not include any other text outside of this JSON array.
Example of one exercise object in the array:
{
    "name": "",
    "steps": "",
    "sets": integer,
    "repetitions": integer,
    "youtubeUrl": ""
}`;

  let result;
  try {
    result = await generateContent(prompt);
    console.log("Gemini Response:", result);

    // Tidak perlu JSON.parse lagi karena sudah di-parse di gemini.api.js
    const generatedExercises = result;

    if (!Array.isArray(generatedExercises) || generatedExercises.length === 0) {
      console.error(
        "AI did not return a valid array of exercises.",
        generatedExercises
      );
      throw {
        name: "AIError",
        message: "AI did not return a valid array of exercises.",
      };
    }

    // Validasi untuk memastikan format sesuai dengan schema
    for (const ex of generatedExercises) {
      if (
        !ex.name ||
        !ex.steps ||
        !ex.sets ||
        !ex.repetitions ||
        !ex.youtubeUrl
      ) {
        console.error("Invalid exercise format from AI:", ex);
        throw {
          name: "AIError",
          message: "AI returned exercise with missing fields.",
        };
      }
    }

    return generatedExercises.slice(0, 5);
  } catch (error) {
    console.error("Error calling Gemini AI:", error);
    if (error instanceof SyntaxError) {
      console.error(
        "Failed to parse JSON from Gemini. Raw response was:",
        result
      );
    }
    throw {
      name: "AIError",
      message: `Failed to generate exercises from AI: ${error.message}`,
    };
  }
}
