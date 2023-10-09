const AshanPattern = /Ашан/;
const BoltPattern = /Bolt/;
const JakdojadePattern = /Jakdojade/;
const HMPattern = /HM/;
const McDonaldsPattern = /McDonald’s/;
const YouTubePattern = /YouTube/;
const GitHubPattern = /GitHub/;
const PysznePattern = /pyszne.pl/;
const bankPattern = /З гривневого рахунку ФОП/;

const foodGroup = [AshanPattern];
const ridesGroup = [BoltPattern, JakdojadePattern];
const restorauntGroup = [McDonaldsPattern];
const mediaGroup = [YouTubePattern, GitHubPattern];
const shopGroup = [HMPattern];
const deliveryGroup = [PysznePattern];
const bankGroup = [bankPattern];

type Tag = 'food' | 'rides' | 'restaurant' | 'media' | 'shop' | 'delivery' | 'bank' | 'other';
export const parseDesctiptionIntoTags = (description: string): Tag => {
    if (foodGroup.some(pattern => pattern.test(description))) {
        return 'food';
    } else if (ridesGroup.some(pattern => pattern.test(description))) {
        return 'rides';
    } else if (restorauntGroup.some(pattern => pattern.test(description))) {
        return 'restaurant';
    } else if (mediaGroup.some(pattern => pattern.test(description))) {
        return 'media';
    } else if (shopGroup.some(pattern => pattern.test(description))) {
        return 'shop';
    } else if (deliveryGroup.some(pattern => pattern.test(description))) {
        return 'delivery';
    } else if (bankGroup.some(pattern => pattern.test(description))) {
        return 'bank';
    }
    return 'other';
};
