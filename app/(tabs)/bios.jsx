import React, { useState, useRef, useEffect } from 'react';
import { 
  View, Text, SafeAreaView, TouchableOpacity, Modal, TextInput, StyleSheet, Animated,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import ScrollableList from './ScrollableListBios';
import NavigationDrawer from './NavigationDrawer';

const BiosPage = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const slideAnim = useRef(new Animated.Value(-250)).current; // For sidebar animation
  const [showModal, setShowModal] = useState(false);

  const API_URL = "https://aaupetrescue-hta0efhnh2gtgrcv.eastus2-01.azurewebsites.net";


  const [profiles, setProfiles] = useState([]);

  const fetchProfiles = async () => {
    try {
        console.log("Fetching profiles from:", API_URL);

        const response = await fetch(`${API_URL}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        });

        console.log("Response Status:", response.status);
        console.log("Response Headers:", response.headers);

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        console.log("Response Data:", data);
        setProfiles(data);
    } catch (error) {
        console.error("Error fetching profiles:", error);
    }
};


  // Fetch data on component mount
  useEffect(() => {
      fetchProfiles();
  }, []);


  const [newProfile, setNewProfile] = useState({
    name: '',
    petName: '',
    petId: '',
    email: '',
    phone: '',
    preferredContactTime: '',
  });

  // Open & Close Sidebar
  const toggleMenu = () => {
    Animated.timing(slideAnim, {
      toValue: menuOpen ? -250 : 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
    setMenuOpen(!menuOpen);
  };

  // Add new profile
  const addNewProfile = async () => {
    if (Object.values(newProfile).some((val) => val.trim() === "")) {
        console.error("All fields are required.");
        return;
    }

    try {
        console.log("Adding new profile:", newProfile);

        const response = await fetch(`${API_URL}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(newProfile),
        });

        console.log("Response Status:", response.status);
        console.log("Response Headers:", response.headers);

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`Failed to add profile: ${JSON.stringify(errorData)}`);
        }

        console.log("Profile added successfully!");

        fetchProfiles(); // Refresh profiles
        setShowModal(false);
        setNewProfile({
            name: "",
            petName: "",
            petId: "",
            email: "",
            phone: "",
            preferredContactTime: "",
        });
    } catch (error) {
        console.error("Error adding profile:", error);
    }
};



  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Navbar */}
      <View style={styles.navBar}>
        <TouchableOpacity onPress={toggleMenu}>
          <Icon name="bars" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.navTitle}>Bios</Text>
        <TouchableOpacity>
          <Icon name="user" size={24} color="white" />
        </TouchableOpacity>
      </View>

      {/* Sidebar Drawer */}
      <NavigationDrawer slideAnim={slideAnim} closeMenu={toggleMenu} />

      {/* Scrollable List with Profiles */}
      <View style={styles.listContainerBios}>
        <ScrollableList title="Profiles" data={profiles} />
      </View>

      {/* Add Profile Button */}
      <TouchableOpacity style={styles.addButton} onPress={() => setShowModal(true)}>
        <Icon name="plus" size={30} color="white" />
      </TouchableOpacity>

      {/* Modal for Adding New Profile */}
      <Modal
        transparent={true}
        animationType="slide"
        visible={showModal}
        onRequestClose={() => setShowModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add New Profile</Text>
            <TextInput
              style={styles.input}
              placeholder="Name"
              value={newProfile.name}
              onChangeText={(text) => setNewProfile({ ...newProfile, name: text })}
            />
            <TextInput
              style={styles.input}
              placeholder="Pet Name"
              value={newProfile.petName}
              onChangeText={(text) => setNewProfile({ ...newProfile, petName: text })}
            />
            <TextInput
              style={styles.input}
              placeholder="Pet ID"
              value={newProfile.petId}
              onChangeText={(text) => setNewProfile({ ...newProfile, petId: text })}
            />
            <TextInput
              style={styles.input}
              placeholder="Email"
              keyboardType="email-address"
              value={newProfile.email}
              onChangeText={(text) => setNewProfile({ ...newProfile, email: text })}
            />
            <TextInput
              style={styles.input}
              placeholder="Phone"
              keyboardType="phone-pad"
              value={newProfile.phone}
              onChangeText={(text) => setNewProfile({ ...newProfile, phone: text })}
            />
            <TextInput
              style={styles.input}
              placeholder="Contact Time"
              keyboardType="phone-pad"
              value={newProfile.preferredContactTime}
              onChangeText={(text) => setNewProfile({ ...newProfile, preferredContactTime: text })}
            />
            <TouchableOpacity style={styles.saveButton} onPress={addNewProfile}>
              <Text style={styles.saveButtonText}>Save</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cancelButton} onPress={() => setShowModal(false)}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  navBar: {
    width: '100%',
    height: 60,
    backgroundColor: '#333',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  navTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  listContainerBios: {
    flex: 1,
    alignItems: 'center',
    marginTop: 20,
  },
  addButton: {
    position: 'absolute',
    bottom: 30,
    right: 30,
    backgroundColor: '#333',
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '80%',
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  input: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
  },
  saveButton: {
    backgroundColor: 'green',
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
  },
  saveButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  cancelButton: {
    backgroundColor: 'red',
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
  },
  cancelButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default BiosPage;
