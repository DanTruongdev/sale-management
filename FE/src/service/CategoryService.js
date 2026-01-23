export const CategoryService = {
    getCategories() {
        return [
            {
                id: 1,
                categoryGroupId: 1,
                name: 'Trà',
                code: 'DRINK_TEA',
                note: 'Đồ uống'
            },
            {
                id: 2,
                categoryGroupId: 1,
                name: 'Cà phê',
                code: 'DRINK_COFFEE',
                note: 'Đồ uống'
            },
            {
                id: 3,
                categoryGroupId: 1,
                name: 'Bánh',
                code: 'FOOD_CAKE',
                note: 'Đồ ăn'
            },
            {
                id: 4,
                categoryGroupId: 1,
                name: 'Bim bim',
                code: 'FOOD_SNACK',
                note: 'Đồ ăn vặt'
            },
            {
                id: 5,
                categoryGroupId: 3,
                name: 'Fiction',
                code: 'FICT',
                note: 'Story books'
            },
            {
                id: 6,
                categoryGroupId: 3,
                name: 'Non-Fiction',
                code: 'NONFICT',
                note: 'Educational books'
            },
            {
                id: 7,
                categoryGroupId: 4,
                name: 'Furniture',
                code: 'FURN',
                note: 'Home furnishings'
            },
            {
                id: 8,
                categoryGroupId: 4,
                name: 'Gardening Tools',
                code: 'GARDTOOL',
                note: 'Tools for gardening'
            },
            {
                id: 9,
                categoryGroupId: 5,
                name: 'Football',
                code: 'FOOTBALL',
                note: 'Sports equipment for football'
            },
            {
                id: 10,
                categoryGroupId: 5,
                name: 'Basketball',
                code: 'BASKET',
                note: 'Sports equipment for basketball'
            }
        ];
    },

    getCategoriesByGroupId(categoryGroupId) {
        return this.getCategories().filter((cat) => cat.categoryGroupId === categoryGroupId);
    }
};
