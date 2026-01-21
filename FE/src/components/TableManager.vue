<script setup>
import Button from 'primevue/button';
import Card from 'primevue/card';
import Column from 'primevue/column';
import DataTable from 'primevue/datatable';
import InputNumber from 'primevue/inputnumber';
import InputText from 'primevue/inputtext';
import { useToast } from 'primevue/usetoast';
import { computed, ref } from 'vue';
const toast = useToast();
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

// Split table logic
const splitDialogVisible = ref(false);
const splitTargetTable = ref(null);
const splitTargetTableCopy = ref(null);
const transferQuantity = ref({});
const splitTableOptions = computed(() => tables.value.filter((t) => t.id !== selectedTable.value?.id));

// function addTable() {
//     const nextId = tables.value.length + 1;
//     tables.value.push({
//         id: nextId,
//         name: `Bàn ${nextId}`,
//         guests: 0,
//         status: 'empty',
//         drinks: []
//     });
// }

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

function calculateTotal(drinks) {
    return drinks.reduce((sum, d) => sum + d.qty * d.price, 0);
}

const totalPrice = computed(() => {
    return editData.value.drinks.reduce((sum, d) => sum + d.qty * d.price, 0);
});

function confirmTable() {
    if (!editData.value.drinks || editData.value.drinks.length === 0) {
        toast.add({ severity: 'warn', summary: 'Warning', detail: 'Vui lòng chọn ít nhất một đồ uống', life: 3000 });
        return;
    }
    Object.assign(selectedTable.value, editData.value, { status: 'occupied' });
    drawerVisible.value = false;
}

function payTable() {
    // Thanh toán: reset bàn
    Object.assign(selectedTable.value, { guests: 0, drinks: [], status: 'empty' });
    drawerVisible.value = false;
}
function cancelReserve() {
    Object.assign(selectedTable.value, { guests: 0, drinks: [], status: 'empty' });
    drawerVisible.value = false;
}

function splitTable() {
    splitTargetTable.value = null;
    splitTargetTableCopy.value = null;
    transferQuantity.value = {};
    splitDialogVisible.value = true;
}

function handleSelectSplitTable() {
    if (splitTargetTable.value) {
        // Tạo bản copy của bàn được chọn để thao tác
        splitTargetTableCopy.value = JSON.parse(JSON.stringify(splitTargetTable.value));
    }
}

function transferDrink(drinkId, fromTable, toTable, qty) {
    const sourceDrinks = fromTable === 'current' ? editData.value.drinks : splitTargetTableCopy.value.drinks;
    const targetDrinks = fromTable === 'current' ? splitTargetTableCopy.value.drinks : editData.value.drinks;

    const drinkIndex = sourceDrinks.findIndex((d) => d.id === drinkId);
    if (drinkIndex === -1) return;

    const drink = sourceDrinks[drinkIndex];
    const transferQty = qty || drink.qty;

    if (transferQty > drink.qty) {
        toast.add({ severity: 'warn', summary: 'Cảnh báo', detail: 'Số lượng chuyển không được vượt quá số lượng hiện có!', life: 2000 });
        return;
    }

    // Giảm số lượng ở bàn nguồn
    if (transferQty === drink.qty) {
        sourceDrinks.splice(drinkIndex, 1);
    } else {
        drink.qty -= transferQty;
    }

    // Thêm vào bàn đích
    const existingDrink = targetDrinks.find((d) => d.id === drinkId);
    if (existingDrink) {
        existingDrink.qty += transferQty;
    } else {
        targetDrinks.push({ ...drink, qty: transferQty });
    }

    // Reset transfer quantity
    delete transferQuantity.value[drinkId];
}

function saveSplitTable() {
    if (!splitTargetTable.value || !splitTargetTableCopy.value) {
        toast.add({ severity: 'warn', summary: 'Warning', detail: 'Vui lòng chọn bàn muốn tách!', life: 3000 });
        return;
    }

    // Cập nhật dữ liệu từ bản copy vào bàn thật
    Object.assign(splitTargetTable.value, splitTargetTableCopy.value);

    // Cập nhật bàn hiện tại từ editData
    Object.assign(selectedTable.value, editData.value);

    // Cập nhật trạng thái bàn hiện tại
    if (selectedTable.value.drinks.length === 0) {
        selectedTable.value.status = 'empty';
        selectedTable.value.guests = 0;
    }

    // Cập nhật trạng thái bàn tách
    if (splitTargetTable.value.drinks.length === 0) {
        splitTargetTable.value.status = 'empty';
        splitTargetTable.value.guests = 0;
    } else if (splitTargetTable.value.status === 'empty' || splitTargetTable.value.status === 'reserved') {
        splitTargetTable.value.status = 'occupied';
    }

    splitDialogVisible.value = false;

    // Nếu bàn hiện tại không còn đồ uống, đóng drawer
    if (selectedTable.value.drinks.length === 0) {
        drawerVisible.value = false;
    }

    toast.add({ severity: 'success', summary: 'Tách bàn', detail: 'Đã tách bàn thành công!', life: 2000 });
}

function closeSplitDialog() {
    // Khi đóng dialog mà không lưu, các thay đổi trên bản copy sẽ bị hủy
    // editData vẫn giữ nguyên, splitTargetTableCopy sẽ bị reset
    splitDialogVisible.value = false;
    splitTargetTable.value = null;
    splitTargetTableCopy.value = null;
    transferQuantity.value = {};
}

function mergeTable() {
    // Gộp bàn: logic demo, thực tế cần UI chọn bàn để gộp
    toast.add({ severity: 'warn', summary: 'Warning', detail: 'Chức năng tách bàn sẽ được phát triển thêm!', life: 3000 });
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
                <div class="mb-1">
                    Tổng tiền: <span class="font-bold text-green-600">{{ formatCurrency(calculateTotal(table.drinks)) }}</span>
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
                        <DataTable :value="filteredDrinks" class="mb-2" scrollHeight="240px" size="small" :rows="5">
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
                    <Button v-if="selectedTable.status === 'reserved'" @click="cancelReserve" label="Hủy đặt bàn" icon="pi pi-ban" severity="danger" />
                    <Button v-if="selectedTable.status === 'occupied'" @click="splitTable" label="Tách bàn" icon="pi pi-external-link" severity="warn" />
                    <Button v-if="selectedTable.status === 'occupied'" @click="mergeTable" label="Gộp bàn" icon="pi pi-link" severity="help" />
                    <Button @click="drawerVisible = false" label="Đóng" icon="pi pi-times" severity="secondary" outlined />
                </div>
            </template>
        </Drawer>

        <!-- Split Table Dialog -->
        <Dialog v-model:visible="splitDialogVisible" header="Tách bàn" :modal="true" :style="{ width: '800px' }">
            <template #default>
                <div class="mb-4">
                    <label class="block mb-2 font-medium">Chọn bàn muốn tách</label>
                    <select v-model="splitTargetTable" class="w-full border rounded p-2" @change="handleSelectSplitTable">
                        <option :value="null">-- Chọn bàn --</option>
                        <option v-for="table in splitTableOptions" :key="table.id" :value="table">{{ table.name }} ({{ statusText(table.status) }})</option>
                    </select>
                </div>
                <div v-if="splitTargetTableCopy" class="mb-4">
                    <div class="grid grid-cols-2 gap-4">
                        <!-- Bàn hiện tại -->
                        <div class="border rounded p-3">
                            <h3 class="font-semibold text-lg mb-3 text-center">{{ editData.name }}</h3>
                            <DataTable :value="editData.drinks" size="small" :rows="10" scrollHeight="300px">
                                <template #empty>
                                    <div class="text-center text-gray-500 py-4">Không có đồ uống</div>
                                </template>
                                <Column field="name" header="Đồ uống"></Column>
                                <Column field="qty" header="SL" style="width: 80px">
                                    <template #body="{ data }">
                                        <span class="font-semibold">{{ data.qty }}</span>
                                    </template>
                                </Column>
                                <Column header="" style="width: 120px">
                                    <template #body="{ data }">
                                        <div class="flex items-center gap-1">
                                            <InputNumber v-if="data.qty > 1" v-model="transferQuantity[data.id]" :min="1" :max="data.qty" :placeholder="data.qty.toString()" inputStyle="width: 50px" class="text-xs" />
                                            <Button
                                                icon="pi pi-arrow-right"
                                                size="small"
                                                severity="info"
                                                text
                                                @click="transferDrink(data.id, 'current', 'target', transferQuantity[data.id] || data.qty)"
                                                v-tooltip.top="'Chuyển sang ' + splitTargetTableCopy.name"
                                            />
                                        </div>
                                    </template>
                                </Column>
                            </DataTable>
                        </div>

                        <!-- Bàn tách -->
                        <div class="border rounded p-3">
                            <h3 class="font-semibold text-lg mb-3 text-center">{{ splitTargetTableCopy.name }}</h3>
                            <DataTable :value="splitTargetTableCopy.drinks" size="small" :rows="10" scrollHeight="300px">
                                <template #empty>
                                    <div class="text-center text-gray-500 py-4">Không có đồ uống</div>
                                </template>
                                <Column header="" style="width: 120px">
                                    <template #body="{ data }">
                                        <div class="flex items-center gap-1">
                                            <Button
                                                icon="pi pi-arrow-left"
                                                size="small"
                                                severity="info"
                                                text
                                                @click="transferDrink(data.id, 'target', 'current', transferQuantity[data.id] || data.qty)"
                                                v-tooltip.top="'Chuyển sang ' + editData.name"
                                            />
                                            <InputNumber v-if="data.qty > 1" v-model="transferQuantity[data.id]" :min="1" :max="data.qty" :placeholder="data.qty.toString()" inputStyle="width: 50px" class="text-xs" />
                                        </div>
                                    </template>
                                </Column>
                                <Column field="name" header="Đồ uống"></Column>
                                <Column field="qty" header="SL" style="width: 80px">
                                    <template #body="{ data }">
                                        <span class="font-semibold">{{ data.qty }}</span>
                                    </template>
                                </Column>
                            </DataTable>
                        </div>
                    </div>
                </div>
                <div class="flex gap-2 justify-end mt-4">
                    <Button label="Lưu" icon="pi pi-check" severity="primary" @click="saveSplitTable" />
                    <Button label="Đóng" icon="pi pi-times" severity="secondary" outlined @click="closeSplitDialog" />
                </div>
            </template>
        </Dialog>
    </div>
</template>

<style scoped></style>
