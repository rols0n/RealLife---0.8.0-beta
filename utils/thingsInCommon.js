// group obj
// loggedUser obj

// things in common: friends/ friend of friend/

module.exports = async function (group, loggedUser) {
  const users = [];
  Array.prototype.forEach.call(group.members, async (member) => {
    const obj = {
      mutualFriends: [],
      schema: member,
      sameCity: false,
      commonGroups: 0,
      friends: false,
    };
    const schema = member._id;
    let canPush = false;
    // 1) Check if the loggedUser and the membersFriend are friends
    schema.friends.forEach((membersFriend) => {
      if (`${loggedUser._id}` !== `${schema._id}`) {
        if (`${loggedUser._id}` === `${membersFriend._id}`) {
          obj.friends = true;
          canPush = true;
        }
        // 2) Check the ammount of common friends
        loggedUser.friends.forEach((usersFriend) => {
          // console.log(usersFriend._id, membersFriend._id);
          if (`${usersFriend._id}` === `${membersFriend._id}`) {
            obj.mutualFriends.push(membersFriend);
            canPush = true;
          }
        });
      }
    });
    if (canPush === true) users.push(obj);
    // console.log(users);
  });
  return users;
};
