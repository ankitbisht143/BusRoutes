import React, {Component} from 'react';
import {View,Dimensions,StyleSheet,Image,TouchableOpacity,Text} from 'react-native';
import MapView from 'react-native-maps';
import Polyline from '@mapbox/polyline';
import Spinner from 'react-native-loading-spinner-overlay';

const SCREEN_WIDTH=Dimensions.get('window').width;
const SCREEN_HEIGHT=Dimensions.get('window').height;
const LATITUDE=0;
const LONGITUDE=0;
const LATITUDE_DELTA=0.01;
const LONGITUDE_DELTA=0.01;
const API_KEY="AIzaSyAYPCVUL-GfkJNNcySGspTQL34ewSnfxmU"
const radius=5000 // 5km

export default class Map extends Component{
  constructor(props){
    super(props);
    this.findAllRoutes=this.findAllRoutes.bind(this);
    this.onPressLocation=this.onPressLocation.bind(this);

    this.state={
      region:{
        latitude:LATITUDE,
        longitude:LONGITUDE,
        latitudeDelta:LATITUDE_DELTA,
        longitudeDelta:LONGITUDE_DELTA
      },
      markers:[],
      polygonPaths:[],
      loading:true,
      totalDistance:''
    }
  }

  componentWillMount(){
    this.getCurrLocation()
  }

  getCurrLocation(){
    //getting current location
    navigator.geolocation.getCurrentPosition(
      position => {
        this.setState({
          region:{
            latitude:position.coords.latitude,
            longitude:position.coords.longitude,
            latitudeDelta:LATITUDE_DELTA,
            longitudeDelta:LONGITUDE_DELTA
          }
        }, () => {
          this.fetchNEarByBusStops()
        })
      }
    )
  }

  fetchNEarByBusStops(){
    console.log(`https://maps.googleapis.com/maps/api/place/nearbysearch/json?key=${API_KEY}&location=${this.state.region.latitude},${this.state.region.longitude}&radius=${radius}&types=bus_station`);
      fetch(`https://maps.googleapis.com/maps/api/place/nearbysearch/json?key=${API_KEY}&location=${this.state.region.latitude},${this.state.region.longitude}&radius=${radius}&types=bus_station`)
      .then((response) => response.json())
      .then((responseJSON) => {
        if(responseJSON.results && responseJSON.results.length>0){
          this.setState({
            markers:responseJSON.results,
            loading:false
          })
        }
        else{
          this.setState({
            loading:false
          })
        }
      })
  }

  onPressLocation(){
      this.getCurrLocation()
  }

  async findAllRoutes(destlocation) {
        try {
            this.setState({loading:true})
            let resp = await fetch(`https://maps.googleapis.com/maps/api/directions/json?origin=${this.state.region.latitude},${this.state.region.longitude}&destination=${destlocation.lat},${destlocation.lng}&alternatives=true`)
            let respJson = await resp.json();

            var pathArr=[]
            for(var i=0;i<respJson.routes.length;i++){
              let points = Polyline.decode(respJson.routes[i].overview_polyline.points);
                let coords = points.map((point, index) => {
                    return  {
                        latitude : point[0],
                        longitude : point[1],
                    }
                })
                pathArr.push(coords)
            }
              this.setState({
                polygonPaths:pathArr,
                loading:false,
                totalDistance:respJson.routes[0].legs[0].distance.text,
              })

        } catch(error) {
            this.setState({
              loading:false
            })
        }
    }

  render(){
    return(
      <View>
        <Spinner visible={this.state.loading} textStyle={{color: '#FFF',marginTop:-60}} />
          <MapView followsUserLocation={true} style={styles.map} region={this.state.region} showsUserLocation loadingEnabled showsMyLocationButton={true}>
            {this.state.markers.map(marker => (
              <MapView.Marker onCalloutPress={() => this.findAllRoutes(marker.geometry.location)} coordinate={{latitude:marker.geometry.location.lat,longitude:marker.geometry.location.lng}} title={marker.name} description={marker.vicinity}>
                <Image source={require('./assets/marker.png')} style={styles.marker}/>
              </MapView.Marker>
            ))}

            {this.state.polygonPaths.map((path,index) => (
              <MapView.Polyline
                coordinates={path}
                strokeWidth={3}
                strokeColor={index==0?"blue":index==1?"gray":index==2?"purple":index==3?"orange":"black"}/>
            ))}

          </MapView>
          <TouchableOpacity style={styles.circle} activeOpacity={0.7} onPress={this.onPressLocation}>
            <Image source={require('./assets/navigation.png')} style={styles.navigation}/>
          </TouchableOpacity>

      </View>
    )
  }
}

const styles=StyleSheet.create({
  map:{
    width:SCREEN_WIDTH,
    height:SCREEN_HEIGHT,
  },
  marker:{
    width:30,
    height:30
  },
  circle:{
    position:'absolute',
    width:44,
    height:44,
    borderRadius:22,
    shadowColor:'gray',
    shadowRadius:3,
    shadowOpacity:3,
    shadowOffset:{
      	width:0,height:1
    },
    backgroundColor:'white',
    bottom:SCREEN_HEIGHT/6.25,
    right:20,
    zIndex:1,
    justifyContent:'center'
    },
  	navigation:{
    	width:20,
    	height:20,
    	alignSelf:'center'
  	}
})
