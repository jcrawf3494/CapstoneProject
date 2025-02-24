import { View, Text } from 'react-native';
import React from 'react';
import { Tabs } from 'expo-router';
import {NavigationContainer} from '@react-navigation/native';
import  {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import { createDrawerNavigator } from '@react-navigation/drawer';

import HomeScreen from './home';
import Index from '../index';


const Tab = createBottomTabNavigator();


const Drawer = createDrawerNavigator();

const index = () => {
  const Drawer = createDrawerNavigator();

  return(
    
      <Drawer.Navigator initialRouteName ="Home">
        <Drawer.Screen name="Home" component={HomeScreen}/>
        <Drawer.Screen name="Bios" component={BiosScreen}/>
        <Drawer.Screen name="Schedule" component={ScheduleScreen}/>
        <Drawer.Screen name="Profile" component={ProfileScreen}/>

      </Drawer.Navigator>

      
    



  )
}

// export default index(); {

//   return <HomeScreen/>
// }



// export default function TabLayout() {
//   return (

    
//       // <Drawer.Navigator>
//       //   <Drawer.Screen name="Home" component={HomeScreen}/>

//       // </Drawer.Navigator>

//     <NavigationContainer>
//       <Tab.Navigator>
//         <Tab.Screen name="Home" component={HomeScreen}/>


//       </Tab.Navigator>
//     </NavigationContainer>


  
//     // <Tabs>
//     //   <Tabs.Screen name='home' />
//     //   <Tabs.Screen name='bios'/>
//     //   <Tabs.Screen name='schedule'/>
//     //   <Tabs.Screen name='profile'/>



//     // </Tabs>


//   )
// }