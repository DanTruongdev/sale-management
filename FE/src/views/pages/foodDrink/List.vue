<script setup>
import { CategoryGroupService } from '@/service/CategoryGroupService';
import { CategoryService } from '@/service/CategoryService';
import { FoodDrinkService } from '@/service/FoodDrinkService';
import Button from 'primevue/button';
import Column from 'primevue/column';
import DataTable from 'primevue/datatable';
import Dialog from 'primevue/dialog';
import Dropdown from 'primevue/dropdown';
import InputText from 'primevue/inputtext';
import Textarea from 'primevue/textarea';
import { useConfirm } from 'primevue/useconfirm';
import { useToast } from 'primevue/usetoast';
import { onBeforeMount, ref } from 'vue';

const toast = useToast();
const confirm = useConfirm();
const foodDrinks = ref(null);
const loading = ref(true);
const allFoodDrinks = ref(null);
const searchName = ref('');
const searchCategoryId = ref(null);
const first = ref(0);
const addDialogVisible = ref(false);
const newFoodDrinkName = ref('');
const newFoodDrinkDescription = ref('');
const newFoodDrinkCategoryId = ref(null);
const newFoodDrinkCurrentPrice = ref('');
const newFoodDrinkPromotionPrice = ref('0');
const newFoodDrinkImages = ref('');
const editDialogVisible = ref(false);
const editFoodDrink = ref(null);
const editFoodDrinkName = ref('');
const editFoodDrinkDescription = ref('');
const editFoodDrinkCategoryId = ref(null);
const editFoodDrinkCurrentPrice = ref('');
const editFoodDrinkPromotionPrice = ref('0');
const editFoodDrinkImages = ref('');

const foodDrinkGroup = CategoryGroupService.getCategoryGroups().find((g) => g.code === 'FOOD_AND_DRINK');
const categoriesForFoodDrink = foodDrinkGroup ? CategoryService.getCategories().filter((c) => c.categoryGroupId === foodDrinkGroup.id) : [];

onBeforeMount(() => {
    allFoodDrinks.value = FoodDrinkService.getFoodDrinks();
    foodDrinks.value = allFoodDrinks.value;
    loading.value = false;
});

function clearFilter() {
    foodDrinks.value = allFoodDrinks.value;
    searchName.value = '';
    searchCategoryId.value = null;
}

function search() {
    let filtered = allFoodDrinks.value.filter((item) => {
        let match = true;
        if (searchName.value) {
            match = match && item.name.toLowerCase().includes(searchName.value.toLowerCase());
        }
        if (searchCategoryId.value) {
            match = match && item.categoryId === searchCategoryId.value;
        }
        return match;
    });
    foodDrinks.value = filtered;
}

function refresh() {
    clearFilter();
    loading.value = true;
    allFoodDrinks.value = FoodDrinkService.getFoodDrinks();
    foodDrinks.value = allFoodDrinks.value;
    loading.value = false;
}

function addFoodDrink() {
    newFoodDrinkName.value = '';
    newFoodDrinkDescription.value = '';
    newFoodDrinkCategoryId.value = null;
    newFoodDrinkCurrentPrice.value = '';
    newFoodDrinkPromotionPrice.value = '0';
    newFoodDrinkImages.value = '';
    addDialogVisible.value = true;
}

function saveFoodDrink() {
    if (!newFoodDrinkName.value.trim() || !newFoodDrinkCategoryId.value || !newFoodDrinkCurrentPrice.value.trim()) {
        toast.add({ severity: 'error', summary: 'Lỗi', detail: 'Vui lòng nhập đầy đủ tên, danh mục và giá hiện tại.', life: 3000 });
        return;
    }
    const newId = Math.max(...allFoodDrinks.value.map((f) => f.id)) + 1;
    const newFoodDrink = {
        id: newId,
        name: newFoodDrinkName.value.trim(),
        description: newFoodDrinkDescription.value.trim(),
        categoryId: newFoodDrinkCategoryId.value,
        currentPrice: parseFloat(newFoodDrinkCurrentPrice.value) || 0,
        promotionPrice: parseFloat(newFoodDrinkPromotionPrice.value) || 0,
        images: newFoodDrinkImages.value.trim()
    };
    allFoodDrinks.value.push(newFoodDrink);
    foodDrinks.value = [...allFoodDrinks.value];
    addDialogVisible.value = false;
    toast.add({ severity: 'success', summary: 'Thành công', detail: 'Đã thêm món ăn/uống mới.', life: 3000 });
}

function cancelAdd() {
    addDialogVisible.value = false;
}

function editFoodDrinkItem(item) {
    editFoodDrink.value = item;
    editFoodDrinkName.value = item.name;
    editFoodDrinkDescription.value = item.description;
    editFoodDrinkCategoryId.value = item.categoryId;
    editFoodDrinkCurrentPrice.value = item.currentPrice.toString();
    editFoodDrinkPromotionPrice.value = item.promotionPrice.toString();
    editFoodDrinkImages.value = item.images || '';
    editDialogVisible.value = true;
}

function saveEditFoodDrink() {
    if (!editFoodDrinkName.value.trim() || !editFoodDrinkCategoryId.value || !editFoodDrinkCurrentPrice.value.trim()) {
        toast.add({ severity: 'error', summary: 'Lỗi', detail: 'Vui lòng nhập đầy đủ tên, danh mục và giá hiện tại.', life: 3000 });
        return;
    }
    editFoodDrink.value.name = editFoodDrinkName.value.trim();
    editFoodDrink.value.description = editFoodDrinkDescription.value.trim();
    editFoodDrink.value.categoryId = editFoodDrinkCategoryId.value;
    editFoodDrink.value.currentPrice = parseFloat(editFoodDrinkCurrentPrice.value) || 0;
    editFoodDrink.value.promotionPrice = parseFloat(editFoodDrinkPromotionPrice.value) || 0;
    editFoodDrink.value.images = editFoodDrinkImages.value.trim();
    foodDrinks.value = [...allFoodDrinks.value];
    editDialogVisible.value = false;
    toast.add({ severity: 'success', summary: 'Thành công', detail: 'Đã chỉnh sửa món ăn/uống.', life: 3000 });
}

function cancelEdit() {
    editDialogVisible.value = false;
}

function deleteFoodDrinkItem(item) {
    confirm.require({
        message: `Bạn có chắc chắn muốn xóa món "${item.name}"?`,
        header: 'Xác nhận xóa',
        acceptLabel: 'Xóa',
        rejectLabel: 'Hủy',
        acceptIcon: 'pi pi-trash',
        rejectIcon: 'pi pi-times',
        acceptClass: 'p-button-danger',
        rejectClass: 'p-button-secondary',
        accept: () => {
            const index = allFoodDrinks.value.findIndex((f) => f.id === item.id);
            if (index > -1) {
                allFoodDrinks.value.splice(index, 1);
                foodDrinks.value = [...allFoodDrinks.value];
                toast.add({ severity: 'success', summary: 'Thành công', detail: 'Đã xóa món ăn/uống.', life: 3000 });
            }
        }
    });
}

function getCategoryName(categoryId) {
    const category = categoriesForFoodDrink.find((c) => c.id === categoryId);
    return category ? category.name : 'Không tìm thấy';
}

function formatPrice(price) {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
}
</script>

<template>
    <div class="card">
        <div class="flex justify-between items-center mb-4">
            <h5 class="m-0">Quản lý món ăn/uống</h5>
            <Button label="Thêm mới" icon="pi pi-plus" @click="addFoodDrink" />
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div class="col-span-1">
                <label for="searchName" class="block text-sm font-medium mb-2">Tên món</label>
                <InputText id="searchName" v-model="searchName" placeholder="Nhập tên món" />
            </div>
            <div class="col-span-1">
                <label for="searchCategory" class="block text-sm font-medium mb-2">Danh mục</label>
                <Dropdown id="searchCategory" v-model="searchCategoryId" :options="categoriesForFoodDrink" optionLabel="name" optionValue="id" placeholder="Chọn danh mục" class="w-full" showClear />
            </div>
            <div class="col-span-1 flex gap-2 items-end">
                <Button label="Tìm kiếm" icon="pi pi-search" @click="search" />
                <Button label="Làm mới" icon="pi pi-refresh" severity="secondary" @click="refresh" />
            </div>
        </div>

        <DataTable :value="foodDrinks" :paginator="true" :rows="10" :rowsPerPageOptions="[5, 10, 25]" dataKey="id" :rowHover="true" :loading="loading" :first="first" v-model:first="first" showGridlines responsiveLayout="scroll">
            <template #empty> Không tìm thấy món ăn/uống nào. </template>
            <template #loading> Đang tải dữ liệu món ăn/uống. Vui lòng chờ. </template>
            <Column header="STT" style="min-width: 8rem">
                <template #body="{ index }">
                    {{ first + index + 1 }}
                </template>
            </Column>
            <Column field="name" header="Tên món" style="min-width: 12rem">
                <template #body="{ data }">
                    {{ data.name }}
                </template>
            </Column>
            <Column field="description" header="Mô tả" style="min-width: 15rem">
                <template #body="{ data }">
                    {{ data.description }}
                </template>
            </Column>
            <Column header="Danh mục" style="min-width: 12rem">
                <template #body="{ data }">
                    {{ getCategoryName(data.categoryId) }}
                </template>
            </Column>
            <Column field="currentPrice" header="Giá hiện tại" style="min-width: 12rem">
                <template #body="{ data }">
                    {{ formatPrice(data.currentPrice) }}
                </template>
            </Column>
            <Column field="promotionPrice" header="Giá khuyến mãi" style="min-width: 12rem">
                <template #body="{ data }">
                    {{ formatPrice(data.promotionPrice) }}
                </template>
            </Column>
            <Column field="images" header="Hình ảnh" style="min-width: 12rem">
                <template #body="{ data }">
                    <img v-if="data.images" :src="'/demo/images/' + data.images" :alt="data.name" class="w-16 h-16 object-cover rounded" />
                    <span v-else class="text-gray-400">Không có ảnh</span>
                </template>
            </Column>
            <Column header="Hành động" style="min-width: 10rem">
                <template #body="{ data }">
                    <Button icon="pi pi-pencil" severity="info" text rounded @click="editFoodDrinkItem(data)" v-tooltip.top="'Chỉnh sửa'" />
                    <Button icon="pi pi-trash" severity="danger" text rounded @click="deleteFoodDrinkItem(data)" v-tooltip.top="'Xóa'" />
                </template>
            </Column>
        </DataTable>
    </div>

    <Toast />
    <ConfirmPopup />
    <Dialog v-model:visible="addDialogVisible" modal header="Thêm món ăn/uống mới" style="width: 500px">
        <div class="flex flex-col gap-4">
            <div>
                <label for="newName" class="block text-sm font-medium mb-2">Tên món *</label>
                <InputText id="newName" v-model="newFoodDrinkName" placeholder="Nhập tên món" class="w-full" />
            </div>
            <div>
                <label for="newDescription" class="block text-sm font-medium mb-2">Mô tả</label>
                <Textarea id="newDescription" v-model="newFoodDrinkDescription" placeholder="Nhập mô tả" class="w-full" rows="3" />
            </div>
            <div>
                <label for="newCategory" class="block text-sm font-medium mb-2">Danh mục *</label>
                <Dropdown id="newCategory" v-model="newFoodDrinkCategoryId" :options="categoriesForFoodDrink" optionLabel="name" optionValue="id" placeholder="Chọn danh mục" class="w-full" />
            </div>
            <div>
                <label for="newCurrentPrice" class="block text-sm font-medium mb-2">Giá hiện tại *</label>
                <InputText id="newCurrentPrice" v-model="newFoodDrinkCurrentPrice" placeholder="Nhập giá hiện tại" class="w-full" />
            </div>
            <div>
                <label for="newPromotionPrice" class="block text-sm font-medium mb-2">Giá khuyến mãi</label>
                <InputText id="newPromotionPrice" v-model="newFoodDrinkPromotionPrice" placeholder="Nhập giá khuyến mãi (mặc định 0)" class="w-full" />
            </div>
            <div>
                <label for="newImages" class="block text-sm font-medium mb-2">Hình ảnh</label>
                <InputText id="newImages" v-model="newFoodDrinkImages" placeholder="Nhập tên file hình ảnh" class="w-full" />
            </div>
        </div>
        <template #footer>
            <Button label="Hủy" icon="pi pi-times" severity="secondary" @click="cancelAdd" />
            <Button label="Lưu" icon="pi pi-check" @click="saveFoodDrink" />
        </template>
    </Dialog>

    <Dialog v-model:visible="editDialogVisible" modal header="Chỉnh sửa món ăn/uống" style="width: 500px">
        <div class="flex flex-col gap-4">
            <div>
                <label for="editName" class="block text-sm font-medium mb-2">Tên món *</label>
                <InputText id="editName" v-model="editFoodDrinkName" placeholder="Nhập tên món" class="w-full" />
            </div>
            <div>
                <label for="editDescription" class="block text-sm font-medium mb-2">Mô tả</label>
                <Textarea id="editDescription" v-model="editFoodDrinkDescription" placeholder="Nhập mô tả" class="w-full" rows="3" />
            </div>
            <div>
                <label for="editCategory" class="block text-sm font-medium mb-2">Danh mục *</label>
                <Dropdown id="editCategory" v-model="editFoodDrinkCategoryId" :options="categoriesForFoodDrink" optionLabel="name" optionValue="id" placeholder="Chọn danh mục" class="w-full" />
            </div>
            <div>
                <label for="editCurrentPrice" class="block text-sm font-medium mb-2">Giá hiện tại *</label>
                <InputText id="editCurrentPrice" v-model="editFoodDrinkCurrentPrice" placeholder="Nhập giá hiện tại" class="w-full" />
            </div>
            <div>
                <label for="editPromotionPrice" class="block text-sm font-medium mb-2">Giá khuyến mãi</label>
                <InputText id="editPromotionPrice" v-model="editFoodDrinkPromotionPrice" placeholder="Nhập giá khuyến mãi" class="w-full" />
            </div>
            <div>
                <label for="editImages" class="block text-sm font-medium mb-2">Hình ảnh</label>
                <InputText id="editImages" v-model="editFoodDrinkImages" placeholder="Nhập tên file hình ảnh" class="w-full" />
            </div>
        </div>
        <template #footer>
            <Button label="Hủy" icon="pi pi-times" severity="secondary" @click="cancelEdit" />
            <Button label="Lưu" icon="pi pi-check" @click="saveEditFoodDrink" />
        </template>
    </Dialog>
</template>
