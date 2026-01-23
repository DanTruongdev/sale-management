export const FoodDrinkService = {
    getFoodDrinks() {
        return [
            {
                id: 1,
                name: 'Cà phê đen',
                description: 'Cà phê đen nguyên chất',
                categoryId: 1,
                currentPrice: 25000,
                promotionPrice: 0,
                images: 'coffee-black.jpg'
            },
            {
                id: 2,
                name: 'Cà phê sữa',
                description: 'Cà phê pha sữa',
                categoryId: 1,
                currentPrice: 30000,
                promotionPrice: 25000,
                images: 'coffee-milk.jpg'
            },
            {
                id: 3,
                name: 'Trà xanh',
                description: 'Trà xanh tươi mát',
                categoryId: 2,
                currentPrice: 20000,
                promotionPrice: 0,
                images: 'green-tea.jpg'
            },
            {
                id: 4,
                name: 'Sinh tố bơ',
                description: 'Sinh tố bơ tươi ngon',
                categoryId: 2,
                currentPrice: 35000,
                promotionPrice: 30000,
                images: 'avocado-smoothie.jpg'
            },
            {
                id: 5,
                name: 'Bánh mì thịt',
                description: 'Bánh mì kẹp thịt nướng',
                categoryId: 3,
                currentPrice: 40000,
                promotionPrice: 0,
                images: 'meat-baguette.jpg'
            },
            {
                id: 6,
                name: 'Bánh mì pate',
                description: 'Bánh mì với pate',
                categoryId: 3,
                currentPrice: 25000,
                promotionPrice: 20000,
                images: 'pate-baguette.jpg'
            },
            {
                id: 7,
                name: 'Cơm tấm',
                description: 'Cơm tấm sườn bì',
                categoryId: 4,
                currentPrice: 45000,
                promotionPrice: 0,
                images: 'broken-rice.jpg'
            },
            {
                id: 8,
                name: 'Phở bò',
                description: 'Phở bò tái nạm',
                categoryId: 4,
                currentPrice: 50000,
                promotionPrice: 45000,
                images: 'beef-pho.jpg'
            }
        ];
    }
};
