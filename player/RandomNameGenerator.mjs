import {getRandomAdjective} from '../data/adjectives.mjs';
import {getRandomName} from '../data/names.mjs';

export default class RandomNameGenerator {
    getRandomName() {
        const adjective = getRandomAdjective();
        const name = getRandomName();

        return adjective.charAt(0).toUpperCase() + adjective.substring(1)
            + ' ' + name.charAt(0).toUpperCase() + name.substring(1);
    }
}