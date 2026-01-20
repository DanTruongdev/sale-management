<script setup>
import Button from 'primevue/button';
import Card from 'primevue/card';
import Column from 'primevue/column';
import DataTable from 'primevue/datatable';
import InputNumber from 'primevue/inputnumber';
import InputText from 'primevue/inputtext';
import { computed, ref } from 'vue';

const tables = ref([
    { id: 1, name: 'Bàn 1', guests: 0, status: 'empty', drinks: [] },
    { id: 2, name: 'Bàn 2', guests: 2, status: 'occupied', drinks: [{ id: 1, name: 'Cà phê', price: 20000, qty: 2 }] },
    { id: 3, name: 'Bàn 3', guests: 0, status: 'reserved', drinks: [] },
    { id: 4, name: 'Bàn 4', guests: 4, status: 'occupied', drinks: [{ id: 2, name: 'Trà sữa', price: 30000, qty: 4 }] },
    { id: 5, name: 'Bàn 5', guests: 0, status: 'empty', drinks: [] }
]);

const drinksList = ref([
    { id: 1, name: 'Cà phê', price: 20000 },
    { id: 2, name: 'Trà sữa', price: 30000 },
    { id: 3, name: 'Nước cam', price: 25000 },
    { id: 4, name: 'Sinh tố', price: 35000 },
    { id: 5, name: 'Nước lọc', price: 10000 }
]);

const drawerVisible = ref(false);
const selectedTable = ref(null);
const editData = ref({ name: '', guests: 0, drinks: [] });
const drinkSearch = ref('');

function addTable() {
    const nextId = tables.value.length + 1;
    tables.value.push({
        id: nextId,
        name: `Bàn ${nextId}`,
        guests: 0,
        status: 'empty',
        drinks: []
    });
}

function editTable(table) {
    selectedTable.value = table;
    editData.value = JSON.parse(JSON.stringify(table));
    drawerVisible.value = true;
    drinkSearch.value = '';
}

function statusText(status) {
    switch (status) {
        case 'empty':
            return 'Trống';
        case 'occupied':
            return 'Có khách';
        case 'reserved':
            return 'Đã đặt';
        default:
            return '';
    }
}

function statusClass(status) {
    switch (status) {
        case 'empty':
            return 'border-gray-300';
        case 'occupied':
            return 'border-green-400';
        case 'reserved':
            return 'border-yellow-400';
        default:
            return '';
    }
}

function statusBadgeClass(status) {
    switch (status) {
        case 'empty':
            return 'bg-gray-200 text-gray-700';
        case 'occupied':
            return 'bg-green-100 text-green-700';
        case 'reserved':
            return 'bg-yellow-100 text-yellow-800';
        default:
            return '';
    }
}

const filteredDrinks = computed(() => {
    if (!drinkSearch.value) return drinksList.value;
    return drinksList.value.filter((d) => d.name.toLowerCase().includes(drinkSearch.value.toLowerCase()));
});

function selectDrink(drink) {
    const exists = editData.value.drinks.find((d) => d.id === drink.id);
    if (!exists) {
        editData.value.drinks.push({ ...drink, qty: 1 });
    }
}

function addDrink() {
    if (filteredDrinks.value.length === 1) {
        selectDrink(filteredDrinks.value[0]);
    }
}

function removeDrink(idx) {
    editData.value.drinks.splice(idx, 1);
}

function formatCurrency(val) {
    return val.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });
}

const totalPrice = computed(() => {
    return editData.value.drinks.reduce((sum, d) => sum + d.qty * d.price, 0);
});

function confirmTable() {
    Object.assign(selectedTable.value, editData.value, { status: 'occupied' });
    drawerVisible.value = false;
}

function payTable() {
    // Thanh toán: reset bàn
    Object.assign(selectedTable.value, { guests: 0, drinks: [], status: 'empty' });
    drawerVisible.value = false;
}

function splitTable() {
    // Tách bàn: logic demo, thực tế cần UI chọn món để tách
    alert('Chức năng tách bàn sẽ được phát triển thêm!');
}

function mergeTable() {
    // Gộp bàn: logic demo, thực tế cần UI chọn bàn để gộp
    alert('Chức năng gộp bàn sẽ được phát triển thêm!');
}
</script>

<template>
    <div class="p-4">
        <!-- <button class="mb-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition" @click="addTable">Thêm mới bàn</button> -->
        <div class="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
            <div v-for="table in tables" :key="table.id" class="rounded-lg shadow p-4 flex flex-col items-center border border-gray-200 bg-white hover:shadow-lg transition cursor-pointer" :class="statusClass(table.status)" @click="editTable(table)">
                <div class="text-lg font-semibold mb-2">{{ table.name }}</div>
                <div class="mb-1">
                    Số khách: <span class="font-bold">{{ table.guests }}</span>
                </div>
                <div class="text-sm px-2 py-1 rounded" :class="statusBadgeClass(table.status)">
                    {{ statusText(table.status) }}
                </div>
            </div>
        </div>
        <Drawer v-model:visible="drawerVisible" header="Quản lý bàn" :modal="true" :style="{ width: '400px' }" position="right">
            <template v-if="selectedTable">
                <div class="mb-4">
                    <label class="block mb-1 font-medium">Tên bàn</label>
                    <InputText v-model="editData.name" class="w-full" disabled />
                </div>
                <div class="mb-4">
                    <label class="block mb-1 font-medium">Số khách</label>
                    <InputNumber v-model="editData.guests" :min="0" class="w-full" showButtons buttonLayout="horizontal" />
                </div>
                <Card class="mb-4">
                    <template #title>Đồ uống</template>
                    <template #content>
                        <div class="flex mb-2 gap-2">
                            <InputText v-model="drinkSearch" placeholder="Tìm đồ uống..." class="flex-1" />
                            <Button @click="addDrink" label="Thêm" icon="pi pi-plus" severity="success" outlined />
                        </div>
                        <DataTable :value="filteredDrinks" class="mb-2" scrollHeight="120px" size="small" :rows="5">
                            <Column field="name" header="Tên đồ uống" style="width: 60%">
                                <template #body="{ data }">
                                    <span class="cursor-pointer hover:text-blue-600" @click="selectDrink(data)">{{ data.name }}</span>
                                </template>
                            </Column>
                            <Column field="price" header="Giá" style="width: 40%">
                                <template #body="{ data }">
                                    {{ formatCurrency(data.price) }}
                                </template>
                            </Column>
                        </DataTable>
                        <DataTable :value="editData.drinks" class="mb-2" size="small" :rows="5">
                            <Column field="name" header="Tên"></Column>
                            <Column field="qty" header="SL" style="width: 60px">
                                <template #body="{ data }">
                                    <InputNumber v-model="data.qty" :min="1" inputStyle="width: 48px" />
                                </template>
                            </Column>
                            <Column field="price" header="Đơn giá">
                                <template #body="{ data }">
                                    {{ formatCurrency(data.price) }}
                                </template>
                            </Column>
                            <Column header="Thành tiền">
                                <template #body="{ data }">
                                    <b>{{ formatCurrency(data.qty * data.price) }}</b>
                                </template>
                            </Column>
                            <Column header="">
                                <template #body="{ index }">
                                    <Button icon="pi pi-trash" severity="danger" text rounded @click="removeDrink(index)" />
                                </template>
                            </Column>
                        </DataTable>
                    </template>
                </Card>
                <div class="mb-4 font-semibold text-lg flex items-center gap-2">
                    <span>Tổng tiền:</span>
                    <span class="text-blue-600">{{ formatCurrency(totalPrice) }}</span>
                </div>
                <div class="flex gap-2 flex-wrap">
                    <Button @click="confirmTable" label="Lưu" icon="pi pi-check" severity="primary" />
                    <Button v-if="selectedTable.status === 'occupied'" @click="payTable" label="Thanh toán" icon="pi pi-credit-card" severity="success" />
                    <Button v-if="selectedTable.status === 'occupied'" @click="splitTable" label="Tách bàn" icon="pi pi-external-link" severity="warn" />
                    <Button v-if="selectedTable.status === 'occupied'" @click="mergeTable" label="Gộp bàn" icon="pi pi-link" severity="help" />
                    <Button @click="drawerVisible = false" label="Đóng" icon="pi pi-times" severity="secondary" outlined />
                </div>
            </template>
        </Drawer>
    </div>
</template>

<style scoped></style>
