
const MOCK_TABLES = [
    { id: '1', name: 'Table 1', name_zh: '1号桌', status: 'available', capacity: 4, section: 'Main', x: 10, y: 10, shape: 'square' },
    { id: '2', name: 'Table 2', name_zh: '2号桌', status: 'available', capacity: 2, section: 'Main', x: 120, y: 10, shape: 'square' },
    { id: '3', name: 'Table 3', name_zh: '3号桌', status: 'available', capacity: 6, section: 'Main', x: 230, y: 10, shape: 'square' },
    { id: '4', name: 'Bar 1', name_zh: '吧台 1', status: 'available', capacity: 1, section: 'Bar', x: 10, y: 150, shape: 'round' },
    { id: '5', name: 'Bar 2', name_zh: '吧台 2', status: 'available', capacity: 1, section: 'Bar', x: 70, y: 150, shape: 'round' },
    { id: '6', name: 'Patio 1', name_zh: '露台 1', status: 'available', capacity: 4, section: 'Patio', x: 10, y: 250, shape: 'square' },
];

const MOCK_MENU = [
    // --- Appetizers ---
    { id: 'a1', name: 'Soup of the Day', name_zh: '每日例汤', price: 8.00, category: 'appetizers', station: 'chef' },
    { id: 'a2', name: 'Wonton Soup', name_zh: '馄饨汤', price: 11.00, category: 'appetizers', station: 'chef' },
    { id: 'a3', name: 'Vegetarian Spring Rolls(3)', name_zh: '素春卷(3)', price: 10.00, category: 'appetizers', station: 'fryer' },
    { id: 'a4', name: 'Sichuan Cold Jelly Noodles', name_zh: '川北凉粉', price: 10.00, category: 'appetizers', station: 'cold' },
    { id: 'a5', name: 'Sichuan Sliced Beef with Chili Sauce', name_zh: '夫妻肺片', price: 17.00, category: 'appetizers', station: 'cold' },
    { id: 'a6', name: 'Cucumber Salad', name_zh: '拌黄瓜', price: 10.00, category: 'appetizers', station: 'cold' },
    { id: 'a7', name: 'Wood Ear Mushroom Salad', name_zh: '凉拌木耳', price: 10.00, category: 'appetizers', station: 'cold' },
    { id: 'a8', name: 'Wonton with Red Chili Sauce', name_zh: '红油抄手', price: 11.00, category: 'appetizers', station: 'chef' },
    { id: 'a9', name: 'Boiled Edamame', name_zh: '煮毛豆', price: 7.00, category: 'appetizers', station: 'chef' },
    { id: 'a10', name: 'Chicken Wings (10)', name_zh: '炸鸡翅', price: 17.00, category: 'appetizers', station: 'fryer' },
    { id: 'a11', name: 'Shrimp Spring Roll (3)', name_zh: '虾春卷', price: 12.00, category: 'appetizers', station: 'fryer' },

    // --- Main Dishes ---
    { id: 'm1', name: 'Kung Pao Chicken', name_zh: '宫保鸡丁', price: 17.00, category: 'mains', station: 'wok' },
    { id: 'm2', name: 'General Tso\'s Chicken', name_zh: '左宗鸡', price: 17.00, category: 'mains', station: 'wok' },
    { id: 'm3', name: 'Spicy Chicken', name_zh: '辣子鸡', price: 17.00, category: 'mains', station: 'fryer' },
    { id: 'm4', name: 'Wild Mushroom Chicken Pot', name_zh: '小鸡炖蘑菇', price: 18.00, category: 'mains', station: 'chef' },
    { id: 'm5', name: 'Sautéed Beef with Mushroom', name_zh: '蘑菇牛肉', price: 18.00, category: 'mains', station: 'wok' },
    { id: 'm6', name: 'Stir-fried Broccoli Beef', name_zh: '西兰花牛肉', price: 17.00, category: 'mains', station: 'wok' },
    { id: 'm7', name: 'Sauteed Beef with Onion', name_zh: '葱爆牛肉', price: 18.00, category: 'mains', station: 'wok' },
    { id: 'm8', name: 'Braised Beef and Potato', name_zh: '土豆烧牛肉', price: 18.00, category: 'mains', station: 'chef' },
    { id: 'm9', name: 'Sesame Beef', name_zh: '芝麻牛肉', price: 18.00, category: 'mains', station: 'wok' },
    { id: 'm10', name: 'Yuxiang Pork Shreds', name_zh: '鱼香肉丝', price: 17.00, category: 'mains', station: 'wok' },
    { id: 'm11', name: 'Sweet and Sour Pork', name_zh: '咕咾肉', price: 17.00, category: 'mains', station: 'fryer' },
    { id: 'm12', name: 'Braised Pork', name_zh: '红烧肉', price: 17.00, category: 'mains', station: 'chef' },
    { id: 'm13', name: 'Sweet and Sour Fish Fillet', name_zh: '糖醋鱼片', price: 16.00, category: 'mains', station: 'fryer' },
    { id: 'm14', name: 'Sichuan Sauerkraut Fish Fillet', name_zh: '酸菜鱼', price: 20.00, category: 'mains', station: 'chef' },
    { id: 'm15', name: 'Sautéed Lamb with Onion', name_zh: '葱爆羊肉', price: 18.00, category: 'mains', station: 'wok' },
    { id: 'm16', name: 'Stir-fried Lamb with Cumin', name_zh: '孜然羊肉', price: 18.00, category: 'mains', station: 'wok' },
    { id: 'm17', name: 'Mapo Tofu', name_zh: '麻婆豆腐', price: 16.00, category: 'mains', station: 'wok' },
    { id: 'm18', name: 'Seafood Tofu Pot', name_zh: '海鲜豆腐煲', price: 20.00, category: 'mains', station: 'chef' },
    { id: 'm19', name: 'Braised Eggplant', name_zh: '红烧茄子', price: 15.00, category: 'mains', station: 'wok' },
    { id: 'm20', name: 'Sautéed Garlic Broccoli', name_zh: '炒西兰花', price: 15.00, category: 'mains', station: 'wok' },
    { id: 'm21', name: 'Sautéed Baby Bok Choy', name_zh: '炒油菜', price: 15.00, category: 'mains', station: 'wok' },
    { id: 'm22', name: 'Stir-fried Cabbage', name_zh: '手撕包菜', price: 15.00, category: 'mains', station: 'wok' },
    { id: 'm23', name: 'Kung Pao Shrimp', name_zh: '宫保虾', price: 19.00, category: 'mains', station: 'wok' },
    { id: 'm24', name: 'Double Cooked Pork Slices', name_zh: '回锅肉', price: 17.00, category: 'mains', station: 'wok' },
    { id: 'm25', name: 'Stir-fried Green Bean', name_zh: '干煸四季豆', price: 16.00, category: 'mains', station: 'wok' },

    // --- Dumplings ---
    { id: 'd1', name: 'Pan-fried Pork/Cabbage Dumplings (12)', name_zh: '猪肉高丽菜饺(12) 煎', price: 15.00, category: 'dumplings', station: 'fryer' },
    { id: 'd2', name: 'Pork and Cabbage Dumpling (12)', name_zh: '猪肉高丽菜饺 (12)', price: 14.00, category: 'dumplings', station: 'steamer' },
    { id: 'd3', name: 'Seafood and Pork Dumpling (12)', name_zh: '三鲜馅饺 (12)', price: 16.00, category: 'dumplings', station: 'steamer' },
    { id: 'd4', name: 'Pan-fried Seafood and Pork Dumplings (12)', name_zh: '三鲜饺 (12) 煎', price: 17.00, category: 'dumplings', station: 'fryer' },
    { id: 'd5', name: 'Beef with Celery and Mushroom Dumpling (12)', name_zh: '牛肉芹菜蘑菇饺 (12)', price: 15.00, category: 'dumplings', station: 'steamer' },
    { id: 'd6', name: 'Pan-fried Beef with Celery and Mushroom (12)', name_zh: '牛肉饺 (12) 煎', price: 16.00, category: 'dumplings', station: 'fryer' },
    { id: 'd7', name: 'Lamb Dumpling (12)', name_zh: '羊肉饺 (12)', price: 16.00, category: 'dumplings', station: 'steamer' },
    { id: 'd8', name: 'Pan-fried Lamb Dumplings (12)', name_zh: '羊肉饺 (12) 煎', price: 17.00, category: 'dumplings', station: 'fryer' },
    { id: 'd9', name: 'Vegetarian Dumpling (12)', name_zh: '素饺(12)', price: 14.00, category: 'dumplings', station: 'steamer' },
    { id: 'd10', name: 'Pan-fried Vegetable Dumplings (12)', name_zh: '素饺 (12) 煎', price: 15.00, category: 'dumplings', station: 'fryer' },
    { id: 'd11', name: 'Chicken Napa/mushroom Dumpling (12)', name_zh: '鸡肉饺 (12)', price: 15.00, category: 'dumplings', station: 'steamer' },
    { id: 'd12', name: 'Pan-fried Chicken Dumpling (12)', name_zh: '鸡肉饺 (12) 煎', price: 16.00, category: 'dumplings', station: 'fryer' },
    { id: 'd13', name: 'Pan-fried Bao of Pork Filling (6)', name_zh: '生煎包 (6)', price: 14.00, category: 'dumplings', station: 'fryer' },
    { id: 'd14', name: 'Vegan Dumpling', name_zh: '纯素饺', price: 14.00, category: 'dumplings', station: 'steamer' },
    { id: 'd15', name: 'Pan-fried Vegan Dumpling', name_zh: '纯素饺 煎', price: 15.00, category: 'dumplings', station: 'fryer' },
    { id: 'd16', name: 'Pork Xiao Long Bao (8)', name_zh: '猪肉小笼包 (8)', price: 13.00, category: 'dumplings', station: 'steamer' },
    { id: 'd17', name: 'Chicken Xiao Long Bao', name_zh: '鸡肉小笼包', price: 13.00, category: 'dumplings', station: 'steamer' },

    // --- Noodles ---
    { id: 'n1', name: 'Braised Beef Noodle Soup', name_zh: '红烧牛肉面', price: 17.00, category: 'noodles', station: 'chef' },
    { id: 'n2', name: 'Fried Noodle with Vegetables', name_zh: '素炒面', price: 16.00, category: 'noodles', station: 'wok' },
    { id: 'n3', name: 'Fried Noodle with Beef', name_zh: '牛肉炒面', price: 17.00, category: 'noodles', station: 'wok' },
    { id: 'n4', name: 'Fried Noodle with Chicken', name_zh: '鸡肉炒面', price: 17.00, category: 'noodles', station: 'wok' },
    { id: 'n5', name: 'Fried Noodle with Shrimp', name_zh: '虾仁炒面', price: 18.00, category: 'noodles', station: 'wok' },
    { id: 'n6', name: 'Singapore Fried Vermicelli', name_zh: '星洲炒米粉', price: 18.00, category: 'noodles', station: 'wok' },

    // --- Bings ---
    { id: 'b1', name: 'Chinese Scallion Pancake', name_zh: '葱油饼', price: 10.00, category: 'bings', station: 'fryer' },
    { id: 'b2', name: 'Chinese Beef Burrito', name_zh: '牛肉卷饼', price: 16.00, category: 'bings', station: 'cold' },
    { id: 'b3', name: 'Red Bean Paste Pancake', name_zh: '豆沙饼', price: 9.00, category: 'bings', station: 'fryer' },

    // --- Rice ---
    { id: 'r1', name: 'Steamed Rice', name_zh: '白饭', price: 3.00, category: 'rice', station: 'chef' },
    { id: 'r2', name: 'Yangzhou Fried Rice', name_zh: '扬州炒饭', price: 16.00, category: 'rice', station: 'wok' },
    { id: 'r3', name: 'Seafood Fried Rice', name_zh: '海鲜炒饭', price: 17.00, category: 'rice', station: 'wok' },
    { id: 'r4', name: 'Chicken Fried Rice', name_zh: '鸡肉炒饭', price: 15.00, category: 'rice', station: 'wok' },
    { id: 'r5', name: 'Vegetarian Fried Rice', name_zh: '素炒饭', price: 14.00, category: 'rice', station: 'wok' },
    { id: 'r6', name: 'Beef Fried Rice', name_zh: '牛肉炒饭', price: 15.00, category: 'rice', station: 'wok' },

    // --- Beverages ---
    { id: 'v1', name: 'Cola', name_zh: '可乐', price: 2.00, category: 'beverages', station: 'bar' },
    { id: 'v2', name: 'Ginger Ale', name_zh: '姜汁汽水', price: 2.00, category: 'beverages', station: 'bar' },
    { id: 'v3', name: 'Diet Cola', name_zh: '低糖可乐', price: 2.00, category: 'beverages', station: 'bar' },
    { id: 'v4', name: 'Sprite', name_zh: '雪碧', price: 2.00, category: 'beverages', station: 'bar' },
    { id: 'v5', name: 'Iced Tea', name_zh: '冰茶', price: 2.00, category: 'beverages', station: 'bar' },

    // --- Beers & Wines ---
    { id: 'be1', name: 'Budweiser Bottle', name_zh: '百威啤酒', price: 5.75, category: 'beers', station: 'bar' },
    { id: 'be2', name: 'Tsingtao Bottle', name_zh: '青岛啤酒', price: 7.00, category: 'beers', station: 'bar' },
    { id: 'wi1', name: 'Santa Carolina Merlot', name_zh: '红葡萄酒', price: 40.00, category: 'wines', station: 'bar' },

    // --- Lunch Specials ---
    { id: 'l1', name: 'Kung Pao Chicken Lunch', name_zh: '宫保鸡丁午餐', price: 15.00, category: 'lunch_specials', station: 'wok' },
    { id: 'l2', name: 'Mapo Tofu Lunch', name_zh: '麻婆豆腐午餐', price: 15.00, category: 'lunch_specials', station: 'wok' },
    { id: 'l3', name: 'General Tso\'s Chicken Lunch', name_zh: '左宗鸡午餐', price: 15.00, category: 'lunch_specials', station: 'wok' },
    { id: 'l4', name: 'Braised Eggplant Lunch', name_zh: '红烧茄子午餐', price: 15.00, category: 'lunch_specials', station: 'wok' },
];

const STORAGE_KEYS = {
    TABLES: 'pos_tables',
    MENU: 'pos_menu',
    ORDERS: 'pos_orders',
    SHIFTS: 'pos_shifts',
    TRANSACTIONS: 'pos_transactions',
    GIFT_CARDS: 'pos_gift_cards',
    USER: 'pos_user'
};

const getLocal = (key, fallback = []) => {
    try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : fallback;
    } catch (e) {
        return fallback;
    }
};

const setLocal = (key, value) => {
    localStorage.setItem(key, JSON.stringify(value));
};

// Initialize Local Storage with Mocks
// Only initialize if not already present to persist state across refreshes
if (!localStorage.getItem(STORAGE_KEYS.MENU)) {
    setLocal(STORAGE_KEYS.MENU, MOCK_MENU);
}
if (!localStorage.getItem(STORAGE_KEYS.TABLES)) {
    setLocal(STORAGE_KEYS.TABLES, MOCK_TABLES);
}
if (!localStorage.getItem(STORAGE_KEYS.USER)) setLocal(STORAGE_KEYS.USER, { id: 'local-user', email: 'test@example.com', full_name: 'Local Server' });

export const base44 = {
    auth: {
        me: async () => {
            return getLocal(STORAGE_KEYS.USER);
        },
        login: async (email, password) => {
            const user = { id: 'local-user', email, full_name: email.split('@')[0] };
            setLocal(STORAGE_KEYS.USER, user);
            return user;
        },
        logout: async () => {
            localStorage.removeItem(STORAGE_KEYS.USER);
        }
    },
    entities: {
        Table: {
            list: async () => getLocal(STORAGE_KEYS.TABLES),
            update: async (id, data) => {
                const tables = getLocal(STORAGE_KEYS.TABLES);
                const index = tables.findIndex(t => t.id === id);
                if (index !== -1) {
                    tables[index] = { ...tables[index], ...data };
                    setLocal(STORAGE_KEYS.TABLES, tables);
                    return tables[index];
                }
                return null;
            },
            create: async (data) => {
                const tables = getLocal(STORAGE_KEYS.TABLES);
                const newTable = { id: Date.now().toString(), ...data };
                tables.push(newTable);
                setLocal(STORAGE_KEYS.TABLES, tables);
                return newTable;
            },
            delete: async (id) => {
                const tables = getLocal(STORAGE_KEYS.TABLES);
                setLocal(STORAGE_KEYS.TABLES, tables.filter(t => t.id !== id));
            }
        },
        MenuItem: {
            list: async () => getLocal(STORAGE_KEYS.MENU),
            create: async (data) => {
                const menu = getLocal(STORAGE_KEYS.MENU);
                const newItem = { id: Date.now().toString(), ...data };
                menu.push(newItem);
                setLocal(STORAGE_KEYS.MENU, menu);
                return newItem;
            },
            update: async (id, data) => {
                const menu = getLocal(STORAGE_KEYS.MENU);
                const index = menu.findIndex(m => m.id === id);
                if (index !== -1) {
                    menu[index] = { ...menu[index], ...data };
                    setLocal(STORAGE_KEYS.MENU, menu);
                    return menu[index];
                }
                return null;
            },
            delete: async (id) => {
                const menu = getLocal(STORAGE_KEYS.MENU);
                setLocal(STORAGE_KEYS.MENU, menu.filter(m => m.id !== id));
            }
        },
        Order: {
            list: async () => getLocal(STORAGE_KEYS.ORDERS),
            filter: async (criteria) => {
                const orders = getLocal(STORAGE_KEYS.ORDERS);
                return orders.filter(order => {
                    return Object.keys(criteria).every(key => {
                        if (criteria[key] === undefined) return true;
                        if (Array.isArray(criteria[key])) return criteria[key].includes(order[key]);
                        return order[key] === criteria[key];
                    });
                });
            },
            create: async (data) => {
                const orders = getLocal(STORAGE_KEYS.ORDERS);
                const newOrder = {
                    id: Date.now().toString(),
                    ...data,
                    created_at: new Date().toISOString()
                };
                orders.push(newOrder);
                setLocal(STORAGE_KEYS.ORDERS, orders);
                window.dispatchEvent(new CustomEvent('orders-updated', { detail: { type: 'create', data: newOrder } }));
                return newOrder;
            },
            update: async (id, data) => {
                const orders = getLocal(STORAGE_KEYS.ORDERS);
                const index = orders.findIndex(o => o.id === id);
                if (index !== -1) {
                    orders[index] = { ...orders[index], ...data };
                    setLocal(STORAGE_KEYS.ORDERS, orders);
                    window.dispatchEvent(new CustomEvent('orders-updated', { detail: { type: 'update', data: orders[index] } }));
                    return orders[index];
                }
                return null;
            },
            subscribe: (callback) => {
                const handler = (event) => {
                    callback(event.detail);
                };
                window.addEventListener('orders-updated', handler);
                return () => window.removeEventListener('orders-updated', handler);
            }
        },
        Shift: {
            list: async () => getLocal(STORAGE_KEYS.SHIFTS),
            filter: async (criteria) => {
                const shifts = getLocal(STORAGE_KEYS.SHIFTS);
                if (!shifts || shifts.length === 0) return [];
                return shifts.filter(shift => {
                    return Object.keys(criteria).every(key => {
                        return shift[key] === criteria[key];
                    });
                });
            },
            create: async (data) => {
                const shifts = getLocal(STORAGE_KEYS.SHIFTS);
                const newShift = {
                    id: Date.now().toString(),
                    ...data,
                    started_at: data.started_at || new Date().toISOString()
                };
                shifts.push(newShift);
                setLocal(STORAGE_KEYS.SHIFTS, shifts);
                return newShift;
            },
            update: async (id, data) => {
                const shifts = getLocal(STORAGE_KEYS.SHIFTS);
                const index = shifts.findIndex(s => s.id === id);
                if (index !== -1) {
                    shifts[index] = { ...shifts[index], ...data };
                    setLocal(STORAGE_KEYS.SHIFTS, shifts);
                    return shifts[index];
                }
                return null;
            }
        },
        Transaction: {
            list: async () => getLocal(STORAGE_KEYS.TRANSACTIONS),
            filter: async (criteria) => {
                const transactions = getLocal(STORAGE_KEYS.TRANSACTIONS);
                return transactions.filter(t => {
                    return Object.keys(criteria).every(key => {
                        return t[key] === criteria[key];
                    });
                });
            },
            create: async (data) => {
                const transactions = getLocal(STORAGE_KEYS.TRANSACTIONS);
                const newTransaction = {
                    id: Date.now().toString(),
                    ...data,
                    created_at: new Date().toISOString()
                };
                transactions.push(newTransaction);
                setLocal(STORAGE_KEYS.TRANSACTIONS, transactions);
                return newTransaction;
            },
            update: async (id, data) => {
                const transactions = getLocal(STORAGE_KEYS.TRANSACTIONS);
                const index = transactions.findIndex(t => t.id === id);
                if (index !== -1) {
                    transactions[index] = { ...transactions[index], ...data };
                    setLocal(STORAGE_KEYS.TRANSACTIONS, transactions);
                    return transactions[index];
                }
                return null;
            }
        },
        GiftCard: {
            filter: async (criteria) => {
                const cards = getLocal(STORAGE_KEYS.GIFT_CARDS);
                return cards.filter(card => {
                    return Object.keys(criteria).every(key => {
                        return card[key] === criteria[key];
                    });
                });
            },
            create: async (data) => {
                const cards = getLocal(STORAGE_KEYS.GIFT_CARDS);
                const newCard = { id: Date.now().toString(), ...data };
                cards.push(newCard);
                setLocal(STORAGE_KEYS.GIFT_CARDS, cards);
                return newCard;
            },
            update: async (id, data) => {
                const cards = getLocal(STORAGE_KEYS.GIFT_CARDS);
                const index = cards.findIndex(c => c.id === id);
                if (index !== -1) {
                    cards[index] = { ...cards[index], ...data };
                    setLocal(STORAGE_KEYS.GIFT_CARDS, cards);
                    return cards[index];
                }
                return null;
            }
        }
    }
};
