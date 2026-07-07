const mongoose = require("mongoose");
const dotenv = require("dotenv");
const dns = require("dns");

dns.setServers([
  "1.1.1.1",
  "8.8.8.8",
]);

dotenv.config({
  path: "./config.env",
});
const User = require("../models/userModel");
const Group = require("../models/groupModel");
const normalizeSearchValue = require("../utils/normalizeSearchValue");

const run = async () => {
  try {
    const dbConnectionString =
      process.env.DATABASE_CONNECTION_STRING;

    if (!dbConnectionString) {
      throw new Error(
        "DATABASE_CONNECTION_STRING is missing in config.env"
      );
    }

    await mongoose.connect(dbConnectionString, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000,
    });

    console.log("DB connected");

    const users = await User.find()
      .select("firstName lastName")
      .lean();

    const groups = await Group.find()
      .select("name")
      .lean();

    console.log(`Found ${users.length} users`);
    console.log(`Found ${groups.length} groups`);

    if (users.length > 0) {
      const result = await User.bulkWrite(
        users.map((user) => ({
          updateOne: {
            filter: {
              _id: user._id,
            },
            update: {
              $set: {
                searchName: normalizeSearchValue(
                  `${user.firstName}${user.lastName}`
                ),
              },
            },
          },
        }))
      );

      console.log(
        "Updated users:",
        result.modifiedCount ?? result.nModified
      );
    }

    if (groups.length > 0) {
      const result = await Group.bulkWrite(
        groups.map((group) => ({
          updateOne: {
            filter: {
              _id: group._id,
            },
            update: {
              $set: {
                searchName: normalizeSearchValue(
                  group.name
                ),
              },
            },
          },
        }))
      );

      console.log(
        "Updated groups:",
        result.modifiedCount ?? result.nModified
      );
    }

    const sampleUser = await User.findOne()
      .select("+searchName firstName lastName")
      .lean();

    console.log("SAMPLE AFTER BACKFILL:");
    console.log(sampleUser);

    await mongoose.connection.close();

    console.log("Backfill completed successfully");
    process.exit(0);
  } catch (err) {
    console.error("Backfill failed:");
    console.error(err);

    await mongoose.connection.close();
    process.exit(1);
  }
};

run();