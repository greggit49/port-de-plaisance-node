const assert = require('assert');
const mongoose = require('mongoose');
const Catway = require('../models/Catway');

let testCatways = []; // Stocke les ID des catways de test

before(async function () {
    // Connexion à la base de données MongoDB
    await mongoose.connect('mongodb://127.0.0.1:27017/devplaisance', {
        useNewUrlParser: true,
        useUnifiedTopology: true
    });
});

after(async function () {
    // Fermeture de la connexion MongoDB après les tests
    await mongoose.disconnect();
});

afterEach(async function () {
    // Supprime uniquement les catways créés durant les tests
    if (testCatways.length > 0) {
        await Catway.deleteMany({ _id: { $in: testCatways } });
        testCatways = []; // Réinitialise la liste après suppression
    }
});

describe('Tests du modèle Catway avec MongoDB', function () {
    it('Devrait créer un nouveau catway', async function () {
        const catway = new Catway({ catwayNumber: 1001, type: "short", catwayState: "bon état" });
        await catway.save();
        testCatways.push(catway._id); // Ajoute l'ID à la liste des tests
    
        const catways = await Catway.find({ catwayNumber: 1001 });
        assert.strictEqual(catways.length, 1);
        assert.strictEqual(catways[0].catwayNumber, 1001);
    });
    
    it('Devrait récupérer tous les catways', async function () {
        // Création de plusieurs catways pour tester la récupération
        const catway1 = new Catway({ catwayNumber: 2001, type: "long", catwayState: "excellent" });
        const catway2 = new Catway({ catwayNumber: 2002, type: "short", catwayState: "moyen" });
        
        await catway1.save();
        await catway2.save();
    
        testCatways.push(catway1._id, catway2._id); // Ajoute les ID pour nettoyage après test
    
        const catways = await Catway.find();
    
        assert(Array.isArray(catways), "Le résultat doit être un tableau");
        assert(catways.length >= 2, "Il devrait y avoir au moins 2 catways dans la base de données");
    });

    it('Devrait récupérer un catway spécifique', async function () {
        const catway = new Catway({ catwayNumber: 1002, type: "long", catwayState: "neuf" });
        await catway.save();
        testCatways.push(catway._id); // Ajoute l'ID à la liste des tests

        const foundCatway = await Catway.findOne({ catwayNumber: 1002 });
        assert(foundCatway, "Aucun catway trouvé !");
        assert.strictEqual(foundCatway.type, "long");
    });

    it('Devrait mettre à jour un catway', async function () {
        const catway = new Catway({ catwayNumber: 1003, type: "short", catwayState: "moyen état" });
        await catway.save();
        testCatways.push(catway._id); // Ajoute l'ID à la liste des tests

        await Catway.updateOne({ catwayNumber: 1003 }, { catwayState: "réparé" });

        const updatedCatway = await Catway.findOne({ catwayNumber: 1003 });
        assert.strictEqual(updatedCatway.catwayState, "réparé");
    });

    it('Devrait supprimer un catway', async function () {
        const catway = new Catway({ catwayNumber: 1004, type: "short", catwayState: "bon état" });
        await catway.save();
        testCatways.push(catway._id); // Ajoute l'ID à la liste des tests

        await Catway.deleteOne({ catwayNumber: 1004 });

        const deletedCatway = await Catway.findOne({ catwayNumber: 1004 });
        assert.strictEqual(deletedCatway, null);
    });
});
