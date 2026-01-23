<script setup>
import { FacilityService } from '@/service/FacilityService';
import { ServingTableService } from '@/service/ServingTableService';
import Button from 'primevue/button';
import Column from 'primevue/column';
import DataTable from 'primevue/datatable';
import Dialog from 'primevue/dialog';
import Dropdown from 'primevue/dropdown';
import InputText from 'primevue/inputtext';
import { useConfirm } from 'primevue/useconfirm';
import { useToast } from 'primevue/usetoast';
import { onBeforeMount, ref } from 'vue';

const toast = useToast();
const confirm = useConfirm();
const servingTables = ref(null);
const loading = ref(true);
const allServingTables = ref(null);
const searchName = ref('');
const searchFloor = ref(null);
const searchFacilityId = ref(null);
const first = ref(0);
const addDialogVisible = ref(false);
const newServingTableName = ref('');
const newServingTableFloor = ref(null);
const newServingTableFacilityId = ref(null);
const editDialogVisible = ref(false);
const editServingTable = ref(null);
const editServingTableName = ref('');
const editServingTableFloor = ref(null);
const editServingTableFacilityId = ref(null);

const floorOptions = Array.from({ length: 10 }, (_, i) => ({ label: (i + 1).toString(), value: i + 1 }));
const facilities = FacilityService.getFacilities();

onBeforeMount(() => {
    allServingTables.value = ServingTableService.getServingTables();
    servingTables.value = allServingTables.value;
    loading.value = false;
});

function clearFilter() {
    servingTables.value = allServingTables.value;
    searchName.value = '';
    searchFloor.value = null;
    searchFacilityId.value = null;
}

function search() {
    let filtered = allServingTables.value.filter((table) => {
        let match = true;
        if (searchName.value) {
            match = match && table.name.toLowerCase().includes(searchName.value.toLowerCase());
        }
        if (searchFloor.value) {
            match = match && table.floor === searchFloor.value;
        }
        if (searchFacilityId.value) {
            match = match && table.facilityId === searchFacilityId.value;
        }
        return match;
    });
    servingTables.value = filtered;
}

function refresh() {
    clearFilter();
    loading.value = true;
    allServingTables.value = ServingTableService.getServingTables();
    servingTables.value = allServingTables.value;
    loading.value = false;
}

function addServingTable() {
    newServingTableName.value = '';
    newServingTableFloor.value = null;
    newServingTableFacilityId.value = null;
    addDialogVisible.value = true;
}

function saveServingTable() {
    if (!newServingTableName.value.trim() || !newServingTableFloor.value || !newServingTableFacilityId.value) {
        toast.add({ severity: 'error', summary: 'Lỗi', detail: 'Vui lòng nhập đầy đủ tên bàn, tầng và cơ sở.', life: 3000 });
        return;
    }
    const newId = Math.max(...allServingTables.value.map((t) => t.id)) + 1;
    const newServingTable = {
        id: newId,
        name: newServingTableName.value.trim(),
        floor: newServingTableFloor.value,
        facilityId: newServingTableFacilityId.value
    };
    allServingTables.value.push(newServingTable);
    servingTables.value = [...allServingTables.value];
    addDialogVisible.value = false;
    toast.add({ severity: 'success', summary: 'Thành công', detail: 'Đã thêm bàn phục vụ mới.', life: 3000 });
}

function cancelAdd() {
    addDialogVisible.value = false;
}

function editServingTableItem(table) {
    editServingTable.value = table;
    editServingTableName.value = table.name;
    editServingTableFloor.value = table.floor;
    editServingTableFacilityId.value = table.facilityId;
    editDialogVisible.value = true;
}

function saveEditServingTable() {
    if (!editServingTableName.value.trim() || !editServingTableFloor.value || !editServingTableFacilityId.value) {
        toast.add({ severity: 'error', summary: 'Lỗi', detail: 'Vui lòng nhập đầy đủ tên bàn, tầng và cơ sở.', life: 3000 });
        return;
    }
    editServingTable.value.name = editServingTableName.value.trim();
    editServingTable.value.floor = editServingTableFloor.value;
    editServingTable.value.facilityId = editServingTableFacilityId.value;
    servingTables.value = [...allServingTables.value];
    editDialogVisible.value = false;
    toast.add({ severity: 'success', summary: 'Thành công', detail: 'Đã chỉnh sửa bàn phục vụ.', life: 3000 });
}

function cancelEdit() {
    editDialogVisible.value = false;
}

function deleteServingTableItem(table) {
    confirm.require({
        message: `Bạn có chắc chắn muốn xóa bàn "${table.name}"?`,
        header: 'Xác nhận xóa',
        acceptLabel: 'Xóa',
        rejectLabel: 'Hủy',
        acceptIcon: 'pi pi-trash',
        rejectIcon: 'pi pi-times',
        acceptClass: 'p-button-danger',
        rejectClass: 'p-button-secondary',
        accept: () => {
            const index = allServingTables.value.findIndex((t) => t.id === table.id);
            if (index > -1) {
                allServingTables.value.splice(index, 1);
                servingTables.value = [...allServingTables.value];
                toast.add({ severity: 'success', summary: 'Thành công', detail: 'Đã xóa bàn phục vụ.', life: 3000 });
            }
        }
    });
}

function getFacilityName(facilityId) {
    const facility = facilities.find((f) => f.id === facilityId);
    return facility ? facility.name : 'Không tìm thấy';
}
</script>

<template>
    <div class="card">
        <div class="flex justify-between items-center mb-4">
            <h5 class="m-0">Quản lý bàn phục vụ</h5>
            <Button label="Thêm mới" icon="pi pi-plus" @click="addServingTable" />
        </div>

        <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <div class="col-span-1">
                <label for="searchName" class="block text-sm font-medium mb-2">Tên bàn</label>
                <InputText id="searchName" v-model="searchName" placeholder="Nhập tên bàn" />
            </div>
            <div class="col-span-1">
                <label for="searchFloor" class="block text-sm font-medium mb-2">Tầng</label>
                <Dropdown id="searchFloor" v-model="searchFloor" :options="floorOptions" optionLabel="label" optionValue="value" placeholder="Chọn tầng" class="w-full" showClear />
            </div>
            <div class="col-span-1">
                <label for="searchFacility" class="block text-sm font-medium mb-2">Cơ sở</label>
                <Dropdown id="searchFacility" v-model="searchFacilityId" :options="facilities" optionLabel="name" optionValue="id" placeholder="Chọn cơ sở" class="w-full" showClear />
            </div>
            <div class="col-span-1 flex gap-2 items-end">
                <Button label="Tìm kiếm" icon="pi pi-search" @click="search" />
                <Button label="Làm mới" icon="pi pi-refresh" severity="secondary" @click="refresh" />
            </div>
        </div>

        <DataTable :value="servingTables" :paginator="true" :rows="10" :rowsPerPageOptions="[5, 10, 25]" dataKey="id" :rowHover="true" :loading="loading" :first="first" v-model:first="first" showGridlines responsiveLayout="scroll">
            <template #empty> Không tìm thấy bàn phục vụ nào. </template>
            <template #loading> Đang tải dữ liệu bàn phục vụ. Vui lòng chờ. </template>
            <Column header="STT" style="min-width: 8rem">
                <template #body="{ index }">
                    {{ first + index + 1 }}
                </template>
            </Column>
            <Column field="name" header="Tên bàn" style="min-width: 12rem">
                <template #body="{ data }">
                    {{ data.name }}
                </template>
            </Column>
            <Column field="floor" header="Tầng" style="min-width: 10rem">
                <template #body="{ data }">
                    {{ data.floor }}
                </template>
            </Column>
            <Column header="Cơ sở" style="min-width: 15rem">
                <template #body="{ data }">
                    {{ getFacilityName(data.facilityId) }}
                </template>
            </Column>
            <Column header="Hành động" style="min-width: 10rem">
                <template #body="{ data }">
                    <Button icon="pi pi-pencil" severity="info" text rounded @click="editServingTableItem(data)" v-tooltip.top="'Chỉnh sửa'" />
                    <Button icon="pi pi-trash" severity="danger" text rounded @click="deleteServingTableItem(data)" v-tooltip.top="'Xóa'" />
                </template>
            </Column>
        </DataTable>
    </div>

    <Toast />
    <ConfirmPopup />
    <Dialog v-model:visible="addDialogVisible" modal header="Thêm bàn phục vụ mới" style="width: 400px">
        <div class="flex flex-col gap-4">
            <div>
                <label for="newName" class="block text-sm font-medium mb-2">Tên bàn *</label>
                <InputText id="newName" v-model="newServingTableName" placeholder="Nhập tên bàn" class="w-full" />
            </div>
            <div>
                <label for="newFloor" class="block text-sm font-medium mb-2">Tầng *</label>
                <Dropdown id="newFloor" v-model="newServingTableFloor" :options="floorOptions" optionLabel="label" optionValue="value" placeholder="Chọn tầng" class="w-full" />
            </div>
            <div>
                <label for="newFacility" class="block text-sm font-medium mb-2">Cơ sở *</label>
                <Dropdown id="newFacility" v-model="newServingTableFacilityId" :options="facilities" optionLabel="name" optionValue="id" placeholder="Chọn cơ sở" class="w-full" />
            </div>
        </div>
        <template #footer>
            <Button label="Hủy" icon="pi pi-times" severity="secondary" @click="cancelAdd" />
            <Button label="Lưu" icon="pi pi-check" @click="saveServingTable" />
        </template>
    </Dialog>

    <Dialog v-model:visible="editDialogVisible" modal header="Chỉnh sửa bàn phục vụ" style="width: 400px">
        <div class="flex flex-col gap-4">
            <div>
                <label for="editName" class="block text-sm font-medium mb-2">Tên bàn *</label>
                <InputText id="editName" v-model="editServingTableName" placeholder="Nhập tên bàn" class="w-full" />
            </div>
            <div>
                <label for="editFloor" class="block text-sm font-medium mb-2">Tầng *</label>
                <Dropdown id="editFloor" v-model="editServingTableFloor" :options="floorOptions" optionLabel="label" optionValue="value" placeholder="Chọn tầng" class="w-full" />
            </div>
            <div>
                <label for="editFacility" class="block text-sm font-medium mb-2">Cơ sở *</label>
                <Dropdown id="editFacility" v-model="editServingTableFacilityId" :options="facilities" optionLabel="name" optionValue="id" placeholder="Chọn cơ sở" class="w-full" />
            </div>
        </div>
        <template #footer>
            <Button label="Hủy" icon="pi pi-times" severity="secondary" @click="cancelEdit" />
            <Button label="Lưu" icon="pi pi-check" @click="saveEditServingTable" />
        </template>
    </Dialog>
</template>
