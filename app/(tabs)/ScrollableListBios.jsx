import React, { useState, useEffect } from "react";
import { View, Text, FlatList, TouchableOpacity, TextInput, Button, StyleSheet } from "react-native";
import Icon from 'react-native-vector-icons/FontAwesome';


const ScrollableListBios = ({ title, data }) => {
    const [profiles, setProfiles] = useState([]);
    const [selectedProfile, setSelectedProfile] = useState(null);
    const [aiGeneratedBio, setAiGeneratedBio] = useState("");

    useEffect(() => {
        fetch("http://localhost:8080/api/profiles")
            .then((response) => response.json())
            .then((data) => setProfiles(data))
            .catch((error) => console.error("Error fetching profiles:", error));
    }, []);

    const handleSelectProfile = (profile) => {
        setSelectedProfile(profile);
        setAiGeneratedBio(""); // Reset bio when selecting a new profile
    };

    const handleBackToList = () => {
      setSelectedProfile(null); // Go back to the list view
  };

    return (
        <View style={styles.listContainerBios}>
          <Text style={styles.header}>{title}</Text>

          
            <FlatList
                data={profiles}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                    <TouchableOpacity onPress={() => handleSelectProfile(item)} style={{ padding: 10, borderBottomWidth: 1 }}>
                        <View style={styles.item}>
                          <Text style={styles.title}>{item.name}</Text>
                          <Text style={styles.description}>Email: {item.email}</Text>
                          <Text style={styles.description}>Phone: {item.phone_number}</Text>
                          <Text style={styles.description}>Pet Name: {item.pet_name}</Text>
                          <Text style={styles.description}>Preferred Contact Time: {item.preferred_contact_time}</Text>
                        </View>
                    </TouchableOpacity>
                )}
            />

            {selectedProfile && (
                <View style={styles.listContainerBios}>
                  <View style={styles.selectedProfileContainer}>
                    <TouchableOpacity onPress={handleBackToList} style={styles.backButton}>
                      <Icon name="arrow-left" size={20} color="#fff" /> 
                    </TouchableOpacity>
                  </View>

                    <Text style={styles.selectedProfileTitle}>{selectedProfile.name}</Text>
                    <Text style={styles.selectedProfileDescription}>Phone: {selectedProfile.phone_number}</Text>
                    <Text style={styles.selectedProfileDescription}>Email: {selectedProfile.email}</Text>
                    <Text style={styles.selectedProfileDescription}>Pet: {selectedProfile.pet_name}</Text>
                    <Text style={styles.selectedProfileDescription}>Preferred Contact Time: {selectedProfile.preferred_contact_time}</Text>

                    {/* AI-Generated Bio Section */}
                    <Text style={styles.bioTitle}>AI-Generated Bio:</Text>
                    <TextInput
                        value={aiGeneratedBio}
                        onChangeText={setAiGeneratedBio}
                        placeholder="AI-generated bio will appear here..."
                        style={styles.bioBox}
                    />
                    {/* <Button title="Generate Bio" onPress={() => generateBio(selectedProfile)} /> */}
                </View>
            )}
            
        </View>
    );
};

const styles = StyleSheet.create({
  backButton: {
    padding: 10,
    backgroundColor: '#000',
    borderRadius: 50,
    position: 'absolute',
    left: 10,
    top: 10,
    zIndex: 1,
  },
  bioTitle: {
    marginTop: 10,
    fontWeight: "bold"
  },
  bioBox: {
    borderWidth: 1,
    padding: 5,
    marginTop: 5 
  },
  selectedProfileTitle: {
    marginTop: '5%',
    marginLeft: '40%',
    fontSize: 18,
    fontWeight: 'bold',
  },
  selectedProfileDescription: {
    marginLeft: '40%',
    fontSize: 14,
    color: 'gray',
  },
  selectedProfileContainer: {
    padding: 10,
    position: 'relative', // Ensure correct positioning for the back button
  },
  listContainerBios: {
    width: '90%',
    height: '90%',
    borderWidth: 3,
    borderColor: 'gold',
    borderRadius: 10,
    backgroundColor: '#fff',
    overflow: 'hidden',
    marginBottom: 20,
  },
  header: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#d9534f',
    textAlign: 'center',
    paddingVertical: 10,
    backgroundColor: 'gold',
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  flatList: {
    flex: 1,
  },
  flatListContent: {
    paddingBottom: 10,
  },
  item: {
    padding: 10,
    marginVertical: 5,
    marginHorizontal: 5,
    backgroundColor: '#fff',
    borderRadius: 8,
    // shadowColor: '#000',
    // shadowOpacity: 0.1,
    // shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  description: {
    fontSize: 14,
    color: 'gray',
  },
});

export default ScrollableListBios;
