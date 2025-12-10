import React, { useState, useRef } from "react";
import {
  View, Text, TextInput, TouchableOpacity,
  FlatList, StyleSheet, Alert, ImageBackground,
  Animated, Easing, ScrollView
} from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

const Stack = createNativeStackNavigator();
const BG = require("./assets/bakery.jpg"); // your bakery background

export default function App() {
  const [user, setUser] = useState(null); // logged in user
  const [items, setItems] = useState([
    { id: "1", name: "Chocolate Cake", price: 12 },
    { id: "2", name: "Blueberry Muffin", price: 4 }
  ]);
  const [cart, setCart] = useState([]);
  const [customers, setCustomers] = useState([]);

  // Staff CRUD
  const addItem = (name, price) => setItems([...items, { id: Date.now().toString(), name, price }]);
  const updateItem = (id, name, price) => setItems(items.map(item => (item.id === id ? { id, name, price } : item)));
  const deleteItem = (id) => setItems(items.filter(i => i.id !== id));

  // Cart
  const addToCart = (item) => setCart([...cart, item]);
  const removeFromCart = (id) => setCart(cart.filter(i => i.id !== id));
  const checkout = () => {
    Alert.alert("Success", "Your order has been placed!");
    setCart([]);
  };

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerTitleAlign: "center" }}>
        <Stack.Screen name="Login">
          {(props) => <LoginScreen {...props} setUser={setUser} customers={customers} />}
        </Stack.Screen>
        <Stack.Screen name="Sign Up">
          {(props) => <SignUpScreen {...props} customers={customers} setCustomers={setCustomers} />}
        </Stack.Screen>
        <Stack.Screen name="Staff Dashboard">
          {(props) => <StaffHome {...props} items={items} deleteItem={deleteItem} user={user} />}
        </Stack.Screen>
        <Stack.Screen name="Add Item">
          {(props) => <AddItemScreen {...props} addItem={addItem} />}
        </Stack.Screen>
        <Stack.Screen name="Edit Item">
          {(props) => <EditItemScreen {...props} updateItem={updateItem} />}
        </Stack.Screen>
        <Stack.Screen name="Customer Dashboard">
          {(props) => <CustomerHome {...props} items={items} addToCart={addToCart} user={user} />}
        </Stack.Screen>
        <Stack.Screen name="Cart">
          {(props) => <CartScreen {...props} cart={cart} removeFromCart={removeFromCart} checkout={checkout} />}
        </Stack.Screen>
        <Stack.Screen name="Payment">
          {(props) => <PaymentScreen {...props} checkout={checkout} cart={cart} />}
        </Stack.Screen>
      </Stack.Navigator>
    </NavigationContainer>
  );
}

/* ========== REUSABLE BACKGROUND ========== */
function ScreenBG({ children }) {
  return (
    <ImageBackground
      source={BG}
      style={{ flex: 1, width: "100%", height: "100%" }}
      imageStyle={{ opacity: 0.35, resizeMode: "cover" }}
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1, padding: 20 }}>
        {children}
      </ScrollView>
    </ImageBackground>
  );
}

/* ========== LOGIN ========== */
function LoginScreen({ navigation, setUser, customers }) {
  const [username, setUsername] = useState("");
  const [pw, setPw] = useState("");

  const handleLogin = () => {
    if (username === "staff" && pw === "1234") {
      setUser({ role: "staff", name: "Staff" });
      navigation.navigate("Staff Dashboard");
    } else {
      const cust = customers.find(c => c.username === username && c.password === pw);
      if (cust) {
        setUser({ role: "customer", name: cust.username });
        navigation.navigate("Customer Dashboard");
      } else Alert.alert("Error", "Invalid login");
    }
  };

  return (
    <ScreenBG>
      <Text style={styles.header}>Welcome to SweetTreats Bakery</Text>
      <TextInput style={styles.input} placeholder="Username" value={username} onChangeText={setUsername} />
      <TextInput style={styles.input} placeholder="Password" secureTextEntry value={pw} onChangeText={setPw} />
      <TouchableOpacity style={styles.loginBtn} onPress={handleLogin}>
        <Text style={styles.btnTxt}>Login</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate("Sign Up")}>
        <Text style={styles.linkText}>Sign Up</Text>
      </TouchableOpacity>
    </ScreenBG>
  );
}

/* ========== SIGN UP ========== */
function SignUpScreen({ navigation, customers, setCustomers }) {
  const [username, setUsername] = useState("");
  const [pw, setPw] = useState("");

  const handleSignUp = () => {
    if (!username || !pw) return Alert.alert("Error", "Fill all fields");
    if (customers.find(c => c.username === username)) return Alert.alert("Error", "Username exists");
    setCustomers([...customers, { username, password: pw }]);
    Alert.alert("Success", "Account created! Login now.");
    navigation.goBack();
  };

  return (
    <ScreenBG>
      <Text style={styles.header}>Sign Up</Text>
      <TextInput style={styles.input} placeholder="Username" value={username} onChangeText={setUsername} />
      <TextInput style={styles.input} placeholder="Password" secureTextEntry value={pw} onChangeText={setPw} />
      <TouchableOpacity style={styles.loginBtn} onPress={handleSignUp}>
        <Text style={styles.btnTxt}>Create Account</Text>
      </TouchableOpacity>
    </ScreenBG>
  );
}

/* ========== STAFF DASHBOARD ========== */
function StaffHome({ navigation, items, deleteItem, user }) {
  if (!user || user.role !== "staff") return <Text>No Access</Text>;
  return (
    <ScreenBG>
      <TouchableOpacity style={styles.addButton} onPress={() => navigation.navigate("Add Item")}>
        <Text style={styles.addText}>+ Add Bakery Item</Text>
      </TouchableOpacity>
      <FlatList
        data={items}
        keyExtractor={i => i.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.title}>{item.name}</Text>
            <Text>${item.price}</Text>
            <View style={styles.row}>
              <TouchableOpacity style={styles.editBtn} onPress={() => navigation.navigate("Edit Item", { item })}>
                <Text style={styles.btnTxt}>Edit</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.deleteBtn} onPress={() => deleteItem(item.id)}>
                <Text style={styles.btnTxt}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
    </ScreenBG>
  );
}

/* ========== CUSTOMER DASHBOARD ========== */
function CustomerHome({ navigation, items, addToCart, user }) {
  if (!user || user.role !== "customer") return <Text>No Access</Text>;
  return (
    <ScreenBG>
      <TouchableOpacity style={[styles.addButton, { backgroundColor: "#2196f3" }]} onPress={() => navigation.navigate("Cart")}>
        <Text style={styles.addText}>View Cart</Text>
      </TouchableOpacity>
      <FlatList
        data={items}
        keyExtractor={i => i.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.title}>{item.name}</Text>
            <Text>${item.price}</Text>
            <TouchableOpacity style={styles.cartBtn} onPress={() => addToCart(item)}>
              <Text style={styles.btnTxt}>Add to Cart</Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </ScreenBG>
  );
}

/* ========== CART SCREEN ========== */
function CartScreen({ cart, removeFromCart, checkout, navigation }) {
  const subtotal = cart.reduce((sum, item) => sum + item.price, 0);
  return (
    <ScreenBG>
      <Text style={styles.header}>Your Pastry Cart</Text>
      <FlatList
        data={cart}
        keyExtractor={(i, idx) => i.id + idx}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text>{item.name}</Text>
            <Text>${item.price}</Text>
            <TouchableOpacity style={styles.deleteBtn} onPress={() => removeFromCart(item.id)}>
              <Text style={styles.btnTxt}>Remove</Text>
            </TouchableOpacity>
          </View>
        )}
      />
      {cart.length > 0 && (
        <TouchableOpacity style={styles.checkoutBtn} onPress={() => navigation.navigate("Payment")}>
          <Text style={styles.btnTxt}>Checkout (${subtotal})</Text>
        </TouchableOpacity>
      )}
    </ScreenBG>
  );
}

/* ========== ADD ITEM ========== */
function AddItemScreen({ navigation, addItem }) {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  return (
    <ScreenBG>
      <TextInput style={styles.input} placeholder="Item name" value={name} onChangeText={setName} />
      <TextInput style={styles.input} placeholder="Price" keyboardType="numeric" value={price} onChangeText={setPrice} />
      <TouchableOpacity style={styles.saveBtn} onPress={() => { addItem(name, Number(price)); navigation.goBack(); }}>
        <Text style={styles.btnTxt}>Save</Text>
      </TouchableOpacity>
    </ScreenBG>
  );
}

/* ========== EDIT ITEM ========== */
function EditItemScreen({ navigation, route, updateItem }) {
  const { item } = route.params;
  const [name, setName] = useState(item.name);
  const [price, setPrice] = useState(String(item.price));
  return (
    <ScreenBG>
      <TextInput style={styles.input} value={name} onChangeText={setName} />
      <TextInput style={styles.input} value={price} keyboardType="numeric" onChangeText={setPrice} />
      <TouchableOpacity style={styles.saveBtn} onPress={() => { updateItem(item.id, name, Number(price)); navigation.goBack(); }}>
        <Text style={styles.btnTxt}>Update</Text>
      </TouchableOpacity>
    </ScreenBG>
  );
}

/* ========== PAYMENT SCREEN ========== */
function PaymentScreen({ checkout, cart, navigation }) {
  const [cardNumber, setCardNumber] = useState("");
  const [exp, setExp] = useState("");
  const [cvv, setCvv] = useState("");
  const [flipped, setFlipped] = useState(false);
  const flipAnim = useRef(new Animated.Value(0)).current;

  const flipCard = () => {
    Animated.timing(flipAnim, { toValue: flipped ? 0 : 180, duration: 500, useNativeDriver: true, easing: Easing.ease }).start();
    setFlipped(!flipped);
  };

  const frontInterpolate = flipAnim.interpolate({ inputRange: [0, 180], outputRange: ["0deg", "180deg"] });
  const backInterpolate = flipAnim.interpolate({ inputRange: [0, 180], outputRange: ["180deg", "360deg"] });

  const handlePay = () => {
    if (!cardNumber || !exp || !cvv) return Alert.alert("Error", "Fill all card details");
    Alert.alert("Payment Success", "Thank you for your order!");
    checkout();
    navigation.popToTop();
  };

  return (
    <ScreenBG>
      <Text style={styles.header}>Payment</Text>
      <View style={{ alignItems: "center", marginVertical: 20 }}>
        {/* CARD FRONT */}
        <Animated.View style={[styles.cardUI, { transform: [{ rotateY: frontInterpolate }] }]}>
          <Text style={styles.cardText}>Card Number: {cardNumber || "XXXX XXXX XXXX XXXX"}</Text>
          <Text style={styles.cardText}>Exp: {exp || "MM/YY"}</Text>
        </Animated.View>
        {/* CARD BACK */}
        <Animated.View style={[styles.cardUI, styles.cardBack, { transform: [{ rotateY: backInterpolate }] }]}>
          <Text style={styles.cardText}>CVV: {cvv || "XXX"}</Text>
        </Animated.View>
      </View>
      <TextInput style={styles.input} placeholder="Card Number" keyboardType="numeric" value={cardNumber} onChangeText={setCardNumber} />
      <TextInput style={styles.input} placeholder="Exp MM/YY" value={exp} onChangeText={setExp} />
      <TextInput style={styles.input} placeholder="CVV" keyboardType="numeric" value={cvv} onChangeText={setCvv} onFocus={flipCard} onBlur={flipCard} />
      <TouchableOpacity style={styles.checkoutBtn} onPress={handlePay}>
        <Text style={styles.btnTxt}>Pay Now</Text>
      </TouchableOpacity>
    </ScreenBG>
  );
}

/* ========== STYLES ========== */
const styles = StyleSheet.create({
  header: {
    fontSize: 26,
    fontWeight: "bold",
    marginBottom: 15,
    textAlign: "center",
    color: "#6b2a00",
    textShadowColor: "#fff",
    textShadowRadius: 4
  },
  input: {
    backgroundColor: "white",
    opacity: 0.9,
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 12,
    borderRadius: 10,
    marginBottom: 15
  },
  loginBtn: { backgroundColor: "#ff7b00", padding: 14, borderRadius: 8, marginBottom: 10 },
  btnTxt: { color: "#fff", textAlign: "center", fontWeight: "bold" },
  linkText: { textAlign: "center", marginTop: 10, color: "#2196f3" },
  addButton: { backgroundColor: "#ff7b00", padding: 14, borderRadius: 10, marginBottom: 15, opacity: 0.95 },
  addText: { color: "#fff", textAlign: "center", fontWeight: "bold" },
  card: { padding: 15, backgroundColor: "rgba(255,255,255,0.85)", borderRadius: 10, marginBottom: 10 },
  title: { fontWeight: "bold", fontSize: 18, color: "#6b2a00" },
  row: { flexDirection: "row", gap: 10, marginTop: 10 },
  editBtn: { backgroundColor: "#4caf50", padding: 10, borderRadius: 6 },
  deleteBtn: { backgroundColor: "#e53935", padding: 10, borderRadius: 6 },
  cartBtn: { backgroundColor: "#2196f3", padding: 10, borderRadius: 6 },
  checkoutBtn: { backgroundColor: "#4caf50", padding: 15, borderRadius: 10, marginTop: 20 },
  saveBtn: { backgroundColor: "#2196f3", padding: 14, borderRadius: 10 },
  cardUI: {
    width: 300,
    height: 180,
    borderRadius: 12,
    backgroundColor: "#ff9a9e", // gradient placeholder
    justifyContent: "center",
    alignItems: "center",
    backfaceVisibility: "hidden",
    position: "absolute"
  },
  cardBack: { backgroundColor: "#333", backfaceVisibility: "hidden" },
  cardText: { color: "#fff", fontWeight: "bold", fontSize: 16 }
});
