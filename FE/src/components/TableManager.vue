<script setup>
import Button from 'primevue/button';
import Column from 'primevue/column';
import DataTable from 'primevue/datatable';
import Dialog from 'primevue/dialog';
import Drawer from 'primevue/drawer';
import InputNumber from 'primevue/inputnumber';
import InputText from 'primevue/inputtext';
import Textarea from 'primevue/textarea';
import { useToast } from 'primevue/usetoast';
import { computed, ref } from 'vue';
const toast = useToast();
const tables = ref([
    { id: 1, name: 'Bàn 1', floor: 1, guests: 0, status: 'empty', drinks: [] },
    { id: 2, name: 'Bàn 2', floor: 1, guests: 2, status: 'occupied', drinks: [{ id: 1, name: 'Cà phê', price: 20000, qty: 2 }] },
    { id: 3, name: 'Bàn 3', floor: 2, guests: 0, status: 'reserved', drinks: [] },
    { id: 4, name: 'Bàn 4', floor: 2, guests: 4, status: 'occupied', drinks: [{ id: 2, name: 'Trà sữa', price: 30000, qty: 4 }] },
    { id: 5, name: 'Bàn 5', floor: 3, guests: 0, status: 'empty', drinks: [] }
]);
// Group tables by floor
const groupedTables = computed(() => {
    const groups = {};
    tables.value.forEach((table) => {
        if (!groups[table.floor]) groups[table.floor] = [];
        groups[table.floor].push(table);
    });
    return groups;
});

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
const cancelTableDialogVisible = ref(false);
const cancelTableReason = ref('');
const cancelTableError = ref('');
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

// function statusBadgeClass(status) {
//     switch (status) {
//         case 'empty':
//             return 'bg-gray-200 text-gray-700';
//         case 'occupied':
//             return 'bg-green-100 text-green-700';
//         case 'reserved':
//             return 'bg-yellow-100 text-yellow-800';
//         default:
//             return '';
//     }
// }
function statusBadgeClass(status) {
    switch (status) {
        case 'empty':
            return 'secondary';
        case 'occupied':
            return 'success';
        case 'reserved':
            return 'warn';
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
function holdTable() {
    // Giữ bàn: đặt trạng thái bàn thành 'reserved'
    Object.assign(selectedTable.value, { guests: 0, drinks: [], status: 'reserved' });
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
// Cancel Table logic
function openCancelTableDialog() {
    cancelTableReason.value = '';
    cancelTableError.value = '';
    cancelTableDialogVisible.value = true;
}
function confirmCancelTable() {
    if (!cancelTableReason.value.trim()) {
        cancelTableError.value = 'Vui lòng nhập lý do hủy bàn!';
        return;
    } // Xóa toàn bộ đồ uống, reset bàn
    Object.assign(selectedTable.value, {
        guests: 0,
        drinks: [],
        status: 'empty'
    });
    cancelTableDialogVisible.value = false;
    drawerVisible.value = false;
    toast.add({ severity: 'info', summary: 'Đã hủy bàn', detail: `Lý do: ${cancelTableReason.value}`, life: 3000 });
}
function closeCancelTableDialog() {
    cancelTableDialogVisible.value = false;
}
</script>

<template>
    <div class="p-4">
        <!-- <button class="mb-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition" @click="addTable">Thêm mới bàn</button> -->
        <div v-for="(tables, floor) in groupedTables" :key="floor" class="mb-8">
            <div class="text-xl font-bold mb-2 flex items-center gap-2">
                <span class="inline-block px-3 py-1 rounded bg-green-100 text-green-600">Tầng {{ floor }}</span>
                <span class="text-gray-500 text-base"
                    >({{ tables.length }} bàn: <span class="text-green-600">{{ tables.filter((t) => t.status === 'occupied').length }} có khách</span>,
                    <span class="text-yellow-500">{{ tables.filter((t) => t.status === 'reserved').length }} đã đặt</span>,
                    <span class="text-gray-700">{{ tables.filter((t) => t.status === 'empty').length }} trống</span>
                    )</span
                >
            </div>
            <div class="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
                <div
                    v-for="table in tables"
                    :key="table.id"
                    class="rounded-lg shadow p-4 flex flex-col items-center border border-gray-200 bg-white hover:shadow-lg transition cursor-pointer"
                    :class="statusClass(table.status)"
                    @click="editTable(table)"
                >
                    <div class="text-lg font-semibold mb-2">{{ table.name }}</div>
                    <div class="mb-1">
                        Số khách: <span class="font-bold">{{ table.guests }}</span>
                    </div>
                    <div class="mb-1">
                        Tổng tiền: <span class="font-bold text-green-600">{{ formatCurrency(calculateTotal(table.drinks)) }}</span>
                    </div>
                    <Button size="small" :label="statusText(table.status)" outlined class="text-sm px-2 py-1 rounded" :severity="statusBadgeClass(table.status)" />
                </div>
            </div>
        </div>
        <Drawer v-model:visible="drawerVisible" :modal="true" :style="{ width: '480px' }" position="right" class="modern-drawer">
            <template #header>
                <div class="drawer-header">
                    <div class="header-icon">
                        <i class="pi pi-table text-2xl"></i>
                    </div>
                    <div class="header-content">
                        <h2 class="header-title">{{ editData.name }}</h2>
                        <span class="header-status" :class="statusBadgeClass(selectedTable?.status)">
                            <i class="pi pi-circle-fill text-[8px] mr-1"></i>
                            {{ statusText(selectedTable?.status) }}
                        </span>
                    </div>
                </div>
            </template>

            <template v-if="selectedTable">
                <div class="drawer-content">
                    <!-- Guest Info Section -->
                    <div class="info-section">
                        <div class="section-header">
                            <i class="pi pi-users text-primary"></i>
                            <span>Thông tin khách</span>
                        </div>
                        <div class="guest-input-wrapper">
                            <label class="input-label">Số lượng khách</label>
                            <InputNumber v-model="editData.guests" :min="0" class="w-full guest-input" showButtons buttonLayout="horizontal" decrementButtonClass="p-button-secondary" incrementButtonClass="p-button-secondary" />
                        </div>
                    </div>

                    <!-- Drinks Menu Section -->
                    <div class="drinks-section">
                        <div class="section-header">
                            <i class="pi pi-shopping-bag text-primary"></i>
                            <span>Menu đồ uống</span>
                        </div>

                        <div class="search-wrapper">
                            <span class="search-icon"><i class="pi pi-search"></i></span>
                            <InputText v-model="drinkSearch" placeholder="Tìm kiếm đồ uống..." class="search-input" @keyup.enter="addDrink" />
                        </div>

                        <div class="drinks-grid">
                            <div v-for="drink in filteredDrinks" :key="drink.id" class="drink-item" :class="{ selected: editData.drinks.find((d) => d.id === drink.id) }" @click="selectDrink(drink)">
                                <div class="drink-info">
                                    <span class="drink-name">{{ drink.name }}</span>
                                    <span class="drink-price">{{ formatCurrency(drink.price) }}</span>
                                </div>
                                <i class="pi pi-plus-circle drink-add-icon"></i>
                            </div>
                        </div>
                    </div>

                    <!-- Selected Drinks Section -->
                    <div class="selected-drinks-section" v-if="editData.drinks.length > 0">
                        <div class="section-header">
                            <i class="pi pi-list text-primary"></i>
                            <span>Đồ uống đã chọn</span>
                            <span class="item-count">{{ editData.drinks.length }} món</span>
                        </div>

                        <div class="selected-drinks-list">
                            <div v-for="(drink, index) in editData.drinks" :key="drink.id" class="selected-drink-item">
                                <div class="drink-details">
                                    <span class="drink-name">{{ drink.name }}</span>
                                    <span class="drink-unit-price">{{ formatCurrency(drink.price) }}/món</span>
                                </div>
                                <div class="drink-quantity">
                                    <Button icon="pi pi-minus" class="qty-btn" severity="secondary" text rounded size="small" @click="drink.qty > 1 ? drink.qty-- : removeDrink(index)" />
                                    <span class="qty-value">{{ drink.qty }}</span>
                                    <Button icon="pi pi-plus" class="qty-btn" severity="secondary" text rounded size="small" @click="drink.qty++" />
                                </div>
                                <div class="drink-subtotal">
                                    {{ formatCurrency(drink.qty * drink.price) }}
                                </div>
                                <Button icon="pi pi-trash" class="remove-btn" severity="danger" text rounded size="small" @click="removeDrink(index)" />
                            </div>
                        </div>
                    </div>

                    <!-- Empty State -->
                    <div v-else class="empty-state">
                        <i class="pi pi-shopping-cart text-4xl text-gray-300"></i>
                        <p>Chưa có đồ uống nào được chọn</p>
                        <span>Nhấn vào món trong menu để thêm</span>
                    </div>
                </div>

                <!-- Footer with Total & Actions -->
                <div class="drawer-footer">
                    <div class="total-section">
                        <div class="total-label">Tổng cộng</div>
                        <div class="total-amount">{{ formatCurrency(totalPrice) }}</div>
                    </div>

                    <div class="action-buttons">
                        <div class="primary-actions">
                            <Button @click="confirmTable" label="Lưu" icon="pi pi-check" class="action-btn save-btn" />
                            <Button v-if="selectedTable.status === 'occupied'" @click="payTable" label="Thanh toán" icon="pi pi-credit-card" class="action-btn pay-btn" severity="success" />
                        </div>

                        <div class="secondary-actions">
                            <Button v-if="selectedTable.status === 'empty'" @click="holdTable" icon="pi pi-credit-card" v-tooltip.top="'Giữ bàn'" class="icon-action-btn" severity="warn" outlined />
                            <Button v-if="selectedTable.status === 'reserved'" @click="cancelReserve" icon="pi pi-ban" v-tooltip.top="'Hủy đặt bàn'" class="icon-action-btn" severity="danger" outlined />
                            <Button v-if="selectedTable.status === 'occupied'" @click="splitTable" icon="pi pi-arrows-h" v-tooltip.top="'Tách bàn'" class="icon-action-btn" severity="help" outlined />
                            <Button v-if="selectedTable.status === 'occupied'" @click="openCancelTableDialog" icon="pi pi-times-circle" v-tooltip.top="'Hủy bàn'" class="icon-action-btn" severity="danger" outlined />
                            <Button @click="drawerVisible = false" icon="pi pi-times" v-tooltip.top="'Đóng'" class="icon-action-btn" severity="secondary" outlined />
                        </div>
                    </div>
                </div>

                <!-- Cancel Table Dialog -->
                <Dialog v-model:visible="cancelTableDialogVisible" header="Hủy bàn" :modal="true" :style="{ width: '400px' }">
                    <template #default>
                        <div class="mb-4">
                            <label class="block mb-2 font-medium">Lý do hủy bàn <span class="text-red-500">*</span></label>
                            <Textarea class="w-full" placeholder="Nhập lý do..." :autoResize="true" rows="3" cols="30" v-model="cancelTableReason" />
                            <div v-if="cancelTableError" class="text-red-500 text-sm mt-1">{{ cancelTableError }}</div>
                        </div>
                        <div class="flex gap-2 justify-end mt-4">
                            <Button label="Xác nhận" icon="pi pi-check" severity="danger" @click="confirmCancelTable" />
                            <Button label="Hủy" icon="pi pi-times" severity="secondary" outlined @click="closeCancelTableDialog" />
                        </div>
                    </template>
                </Dialog>
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

<style scoped>
/* Modern Drawer Styles */
:deep(.modern-drawer .p-drawer-content) {
    padding: 0;
    display: flex;
    flex-direction: column;
    height: 100%;
}

:deep(.modern-drawer .p-drawer-header) {
    padding: 0;
    border-bottom: none;
    background: linear-gradient(135deg, var(--p-primary-500) 0%, var(--p-primary-600) 100%);
}

.drawer-header {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1.25rem 1.5rem;
    width: 100%;
    color: white;
}

.header-icon {
    width: 48px;
    height: 48px;
    background: rgba(255, 255, 255, 0.2);
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    backdrop-filter: blur(10px);
}

.header-content {
    flex: 1;
}

.header-title {
    font-size: 1.25rem;
    font-weight: 600;
    margin: 0 0 0.25rem 0;
}

.header-status {
    display: inline-flex;
    align-items: center;
    padding: 0.25rem 0.75rem;
    border-radius: 20px;
    font-size: 0.75rem;
    font-weight: 500;
    backdrop-filter: blur(10px);
}

/* Drawer Content */
.drawer-content {
    flex: 1;
    overflow-y: auto;
    padding: 1.25rem;
    background: var(--p-surface-50);
}

/* Section Styles */
.info-section,
.drinks-section,
.selected-drinks-section {
    background: white;
    border-radius: 12px;
    padding: 1rem;
    margin-bottom: 1rem;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.section-header {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-weight: 600;
    font-size: 0.9rem;
    color: var(--p-surface-700);
    margin-bottom: 0.75rem;
    padding-bottom: 0.5rem;
    border-bottom: 1px solid var(--p-surface-100);
}

.section-header .item-count {
    margin-left: auto;
    background: var(--p-primary-100);
    color: var(--p-primary-700);
    padding: 0.125rem 0.5rem;
    border-radius: 12px;
    font-size: 0.75rem;
    font-weight: 500;
}

/* Guest Input */
.guest-input-wrapper {
    margin-top: 0.5rem;
}

.input-label {
    display: block;
    font-size: 0.8rem;
    color: var(--p-surface-500);
    margin-bottom: 0.5rem;
}

:deep(.guest-input .p-inputnumber-input) {
    text-align: center;
    font-weight: 600;
    font-size: 1.1rem;
}

/* Search Wrapper */
.search-wrapper {
    position: relative;
    margin-bottom: 0.75rem;
}

.search-icon {
    position: absolute;
    left: 12px;
    top: 50%;
    transform: translateY(-50%);
    color: var(--p-surface-400);
    z-index: 1;
}

:deep(.search-input) {
    width: 100%;
    padding-left: 2.5rem !important;
    border-radius: 8px;
    background: var(--p-surface-50);
    border: 1px solid var(--p-surface-200);
    transition: all 0.2s ease;
}

:deep(.search-input:focus) {
    background: white;
    box-shadow: 0 0 0 2px var(--p-primary-100);
}

/* Drinks Grid */
.drinks-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 0.5rem;
    max-height: 180px;
    overflow-y: auto;
    padding-right: 0.25rem;
}

.drink-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.625rem 0.75rem;
    background: var(--p-surface-50);
    border: 1px solid var(--p-surface-100);
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s ease;
}

.drink-item:hover {
    background: var(--p-primary-50);
    border-color: var(--p-primary-200);
    transform: translateY(-1px);
}

.drink-item.selected {
    background: var(--p-primary-50);
    border-color: var(--p-primary-300);
}

.drink-info {
    display: flex;
    flex-direction: column;
    gap: 0.125rem;
}

.drink-name {
    font-size: 0.8rem;
    font-weight: 500;
    color: var(--p-surface-800);
}

.drink-price {
    font-size: 0.7rem;
    color: var(--p-primary-600);
    font-weight: 500;
}

.drink-add-icon {
    color: var(--p-primary-400);
    font-size: 1rem;
    transition: transform 0.2s ease;
}

.drink-item:hover .drink-add-icon {
    transform: scale(1.2);
    color: var(--p-primary-600);
}

/* Selected Drinks List */
.selected-drinks-list {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

.selected-drink-item {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.75rem;
    background: var(--p-surface-50);
    border-radius: 8px;
    border: 1px solid var(--p-surface-100);
}

.drink-details {
    flex: 1;
    min-width: 0;
}

.drink-details .drink-name {
    font-size: 0.85rem;
    font-weight: 500;
    color: var(--p-surface-800);
    display: block;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.drink-unit-price {
    font-size: 0.7rem;
    color: var(--p-surface-500);
}

.drink-quantity {
    display: flex;
    align-items: center;
    gap: 0.25rem;
    background: white;
    border: 1px solid var(--p-surface-200);
    border-radius: 8px;
    padding: 0.125rem;
}

:deep(.qty-btn) {
    width: 28px !important;
    height: 28px !important;
}

.qty-value {
    min-width: 24px;
    text-align: center;
    font-weight: 600;
    font-size: 0.9rem;
}

.drink-subtotal {
    font-weight: 600;
    font-size: 0.85rem;
    color: var(--p-primary-600);
    min-width: 80px;
    text-align: right;
}

:deep(.remove-btn) {
    opacity: 0.5;
    transition: opacity 0.2s ease;
}

.selected-drink-item:hover :deep(.remove-btn) {
    opacity: 1;
}

/* Empty State */
.empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 2rem;
    background: white;
    border-radius: 12px;
    text-align: center;
}

.empty-state p {
    margin: 0.75rem 0 0.25rem;
    font-weight: 500;
    color: var(--p-surface-600);
}

.empty-state span {
    font-size: 0.8rem;
    color: var(--p-surface-400);
}

/* Drawer Footer */
.drawer-footer {
    background: white;
    border-top: 1px solid var(--p-surface-100);
    padding: 1rem 1.25rem;
    box-shadow: 0 -4px 12px rgba(0, 0, 0, 0.05);
}

.total-section {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
    padding: 0.75rem 1rem;
    background: linear-gradient(135deg, var(--p-primary-50) 0%, var(--p-primary-100) 100%);
    border-radius: 10px;
}

.total-label {
    font-size: 0.9rem;
    color: var(--p-surface-600);
    font-weight: 500;
}

.total-amount {
    font-size: 1.5rem;
    font-weight: 700;
    color: var(--p-primary-600);
}

.action-buttons {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
}

.primary-actions {
    display: flex;
    gap: 0.5rem;
}

:deep(.action-btn) {
    flex: 1;
    justify-content: center;
    padding: 0.75rem 1rem;
    font-weight: 500;
    border-radius: 10px;
}

:deep(.save-btn) {
    background: linear-gradient(135deg, var(--p-primary-500) 0%, var(--p-primary-600) 100%);
    border: none;
}

:deep(.pay-btn) {
    background: linear-gradient(135deg, var(--p-green-500) 0%, var(--p-green-600) 100%);
    border: none;
}

.secondary-actions {
    display: flex;
    justify-content: center;
    gap: 0.5rem;
}

:deep(.icon-action-btn) {
    width: 42px;
    height: 42px;
    border-radius: 10px;
}

/* Scrollbar Styling */
.drawer-content::-webkit-scrollbar,
.drinks-grid::-webkit-scrollbar {
    width: 4px;
}

.drawer-content::-webkit-scrollbar-track,
.drinks-grid::-webkit-scrollbar-track {
    background: transparent;
}

.drawer-content::-webkit-scrollbar-thumb,
.drinks-grid::-webkit-scrollbar-thumb {
    background: var(--p-surface-300);
    border-radius: 4px;
}

.drawer-content::-webkit-scrollbar-thumb:hover,
.drinks-grid::-webkit-scrollbar-thumb:hover {
    background: var(--p-surface-400);
}
</style>
