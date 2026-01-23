<script setup>
import { CategoryGroupService } from '@/service/CategoryGroupService';
import { CategoryService } from '@/service/CategoryService';
import Button from 'primevue/button';
import Column from 'primevue/column';
import DataTable from 'primevue/datatable';
import Dialog from 'primevue/dialog';
import InputText from 'primevue/inputtext';
import Textarea from 'primevue/textarea';
import { useConfirm } from 'primevue/useconfirm';
import { useToast } from 'primevue/usetoast';
import { onBeforeMount, ref } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();
const toast = useToast();
const confirm = useConfirm();
const categories = ref(null);
const loading = ref(true);
const allCategories = ref(null);
const searchCode = ref('');
const searchName = ref('');
const searchNote = ref('');
const first = ref(0);
const addDialogVisible = ref(false);
const newCategoryCode = ref('');
const newCategoryName = ref('');
const newCategoryNote = ref('');
const editDialogVisible = ref(false);
const editCategory = ref(null);
const editCategoryCode = ref('');
const editCategoryName = ref('');
const editCategoryNote = ref('');

const categoryGroupId = parseInt(route.params.categoryGroupId);
const categoryGroupName = ref('');

onBeforeMount(() => {
    allCategories.value = CategoryService.getCategoriesByGroupId(categoryGroupId);
    categories.value = allCategories.value;
    const group = CategoryGroupService.getCategoryGroups().find((g) => g.id === categoryGroupId);
    categoryGroupName.value = group ? group.name : 'Không tìm thấy';
    loading.value = false;
});

function clearFilter() {
    categories.value = allCategories.value;
    searchCode.value = '';
    searchName.value = '';
    searchNote.value = '';
}

function search() {
    let filtered = allCategories.value.filter((cat) => {
        let match = true;
        if (searchCode.value) {
            match = match && cat.code.toLowerCase().includes(searchCode.value.toLowerCase());
        }
        if (searchName.value) {
            match = match && cat.name.toLowerCase().includes(searchName.value.toLowerCase());
        }
        if (searchNote.value) {
            match = match && cat.note.toLowerCase().includes(searchNote.value.toLowerCase());
        }
        return match;
    });
    categories.value = filtered;
}

function refresh() {
    clearFilter();
    loading.value = true;
    allCategories.value = CategoryService.getCategoriesByGroupId(categoryGroupId);
    categories.value = allCategories.value;
    loading.value = false;
}

function addCategory() {
    newCategoryCode.value = '';
    newCategoryName.value = '';
    newCategoryNote.value = '';
    addDialogVisible.value = true;
}

function saveCategory() {
    if (!newCategoryCode.value.trim() || !newCategoryName.value.trim()) {
        toast.add({ severity: 'error', summary: 'Lỗi', detail: 'Vui lòng nhập đầy đủ mã và tên danh mục.', life: 3000 });
        return;
    }
    const newId = Math.max(...allCategories.value.map((c) => c.id)) + 1;
    const newCategory = {
        id: newId,
        categoryGroupId: categoryGroupId,
        code: newCategoryCode.value.trim(),
        name: newCategoryName.value.trim(),
        note: newCategoryNote.value.trim()
    };
    allCategories.value.push(newCategory);
    categories.value = [...allCategories.value];
    addDialogVisible.value = false;
    toast.add({ severity: 'success', summary: 'Thành công', detail: 'Đã thêm danh mục mới.', life: 3000 });
}

function cancelAdd() {
    addDialogVisible.value = false;
}

function editCategoryItem(category) {
    editCategory.value = category;
    editCategoryCode.value = category.code;
    editCategoryName.value = category.name;
    editCategoryNote.value = category.note;
    editDialogVisible.value = true;
}

function saveEditCategory() {
    if (!editCategoryCode.value.trim() || !editCategoryName.value.trim()) {
        toast.add({ severity: 'error', summary: 'Lỗi', detail: 'Vui lòng nhập đầy đủ mã và tên danh mục.', life: 3000 });
        return;
    }
    editCategory.value.code = editCategoryCode.value.trim();
    editCategory.value.name = editCategoryName.value.trim();
    editCategory.value.note = editCategoryNote.value.trim();
    categories.value = [...allCategories.value];
    editDialogVisible.value = false;
    toast.add({ severity: 'success', summary: 'Thành công', detail: 'Đã chỉnh sửa danh mục.', life: 3000 });
}

function cancelEdit() {
    editDialogVisible.value = false;
}

function deleteCategoryItem(category) {
    confirm.require({
        message: `Bạn có chắc chắn muốn xóa danh mục "${category.name}"?`,
        header: 'Xác nhận xóa',
        acceptLabel: 'Xóa',
        rejectLabel: 'Hủy',
        acceptIcon: 'pi pi-trash',
        rejectIcon: 'pi pi-times',
        acceptClass: 'p-button-danger',
        rejectClass: 'p-button-secondary',
        accept: () => {
            const index = allCategories.value.findIndex((c) => c.id === category.id);
            if (index > -1) {
                allCategories.value.splice(index, 1);
                categories.value = [...allCategories.value];
                toast.add({ severity: 'success', summary: 'Thành công', detail: 'Đã xóa danh mục.', life: 3000 });
            }
        }
    });
}
</script>

<template>
    <div class="card">
        <div class="flex justify-between items-center mb-4">
            <h5 class="m-0">Quản lý danh mục (Nhóm: {{ categoryGroupName }})</h5>
            <div class="flex gap-2">
                <Button label="Quay lại" icon="pi pi-arrow-left" severity="secondary" @click="$router.push('/category-group/list')" />
                <Button label="Thêm mới" icon="pi pi-plus" @click="addCategory" />
            </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <div class="col-span-1">
                <label for="searchCode" class="block text-sm font-medium mb-2">Mã danh mục</label>
                <InputText id="searchCode" v-model="searchCode" placeholder="Nhập mã danh mục" />
            </div>
            <div class="col-span-1">
                <label for="searchName" class="block text-sm font-medium mb-2">Tên danh mục</label>
                <InputText id="searchName" v-model="searchName" placeholder="Nhập tên danh mục" />
            </div>
            <!-- <div class="col-span-1">
                <label for="searchNote" class="block text-sm font-medium mb-2">Ghi chú</label>
                <InputText id="searchNote" v-model="searchNote" placeholder="Nhập ghi chú" />
            </div> -->
            <div class="col-span-1 flex gap-2 items-end">
                <Button label="Tìm kiếm" icon="pi pi-search" @click="search" />
                <Button label="Làm mới" icon="pi pi-refresh" severity="secondary" @click="refresh" />
            </div>
        </div>

        <DataTable :value="categories" :paginator="true" :rows="10" :rowsPerPageOptions="[5, 10, 25]" dataKey="id" :rowHover="true" :loading="loading" :first="first" v-model:first="first" showGridlines responsiveLayout="scroll">
            <template #empty> Không tìm thấy danh mục nào. </template>
            <template #loading> Đang tải dữ liệu danh mục. Vui lòng chờ. </template>
            <Column header="STT" style="min-width: 8rem">
                <template #body="{ index }">
                    {{ first + index + 1 }}
                </template>
            </Column>
            <Column field="code" header="Mã" style="min-width: 10rem">
                <template #body="{ data }">
                    {{ data.code }}
                </template>
            </Column>
            <Column field="name" header="Tên" style="min-width: 12rem">
                <template #body="{ data }">
                    {{ data.name }}
                </template>
            </Column>
            <Column field="note" header="Ghi chú" style="min-width: 15rem">
                <template #body="{ data }">
                    {{ data.note }}
                </template>
            </Column>
            <Column header="Hành động" style="min-width: 10rem">
                <template #body="{ data }">
                    <Button icon="pi pi-pencil" severity="info" text rounded @click="editCategoryItem(data)" v-tooltip.top="'Chỉnh sửa'" />
                    <Button icon="pi pi-trash" severity="danger" text rounded @click="deleteCategoryItem(data)" v-tooltip.top="'Xóa'" />
                </template>
            </Column>
        </DataTable>
    </div>

    <Toast />
    <ConfirmPopup />
    <Dialog v-model:visible="addDialogVisible" modal header="Thêm danh mục mới" style="width: 400px">
        <div class="flex flex-col gap-4">
            <div>
                <label for="newCode" class="block text-sm font-medium mb-2">Mã danh mục *</label>
                <InputText id="newCode" v-model="newCategoryCode" placeholder="Nhập mã danh mục" class="w-full" />
            </div>
            <div>
                <label for="newName" class="block text-sm font-medium mb-2">Tên danh mục *</label>
                <InputText id="newName" v-model="newCategoryName" placeholder="Nhập tên danh mục" class="w-full" />
            </div>
            <div>
                <label for="newNote" class="block text-sm font-medium mb-2">Ghi chú</label>
                <Textarea id="newNote" v-model="newCategoryNote" placeholder="Nhập ghi chú" class="w-full" rows="3" />
            </div>
        </div>
        <template #footer>
            <Button label="Hủy" icon="pi pi-times" severity="secondary" @click="cancelAdd" />
            <Button label="Lưu" icon="pi pi-check" @click="saveCategory" />
        </template>
    </Dialog>

    <Dialog v-model:visible="editDialogVisible" modal header="Chỉnh sửa danh mục" style="width: 400px">
        <div class="flex flex-col gap-4">
            <div>
                <label for="editCode" class="block text-sm font-medium mb-2">Mã danh mục *</label>
                <InputText id="editCode" v-model="editCategoryCode" placeholder="Nhập mã danh mục" class="w-full" />
            </div>
            <div>
                <label for="editName" class="block text-sm font-medium mb-2">Tên danh mục *</label>
                <InputText id="editName" v-model="editCategoryName" placeholder="Nhập tên danh mục" class="w-full" />
            </div>
            <div>
                <label for="editNote" class="block text-sm font-medium mb-2">Ghi chú</label>
                <Textarea id="editNote" v-model="editCategoryNote" placeholder="Nhập ghi chú" class="w-full" rows="3" />
            </div>
        </div>
        <template #footer>
            <Button label="Hủy" icon="pi pi-times" severity="secondary" @click="cancelEdit" />
            <Button label="Lưu" icon="pi pi-check" @click="saveEditCategory" />
        </template>
    </Dialog>
</template>
