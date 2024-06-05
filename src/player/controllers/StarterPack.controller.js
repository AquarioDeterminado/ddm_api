const {sequelize} =  require("../../conf/DB.conf");

async function createStarterPack(user) {
   try {
       const dogs = await sequelize.models.dog.findAll();

       const player = (await user.getPlayers())[0];

       for (let i = 0; i < 3; i++) {
           const litter = await sequelize.models.litter.create({active: true});

           await litter.setPlayer(player);
           await litter.setDog(dogs[i]);

           await litter.save();

           if (i < 2) {
               const pack = await sequelize.models.pack.create({active: true, name: "Starter Pack", number_of_uses: 1});
               await pack.setUser(user);
               await pack.setLitter(litter);
               await pack.save();
           }
       }

         return {status: 200, message: "Starter pack created successfully"};
   } catch (e) {
         console.log(e);
         return {status: 500, message: "Internal server error"};
   }
}

module.exports = {createStarterPack};