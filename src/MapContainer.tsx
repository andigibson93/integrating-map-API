import React from "react";
import { GoogleMap, LoadScript, Marker, InfoWindow, DirectionsRenderer, DirectionsService } from '@react-google-maps/api';
import locations from './LocationsData';
//Causes UI Test to fail in App.test.tsx
import { SearchBox } from 'office-ui-fabric-react/lib/SearchBox';
import { Stack, IStackTokens } from 'office-ui-fabric-react/lib/Stack';

const stackTokens: Partial<IStackTokens> = { childrenGap: 20, maxWidth: 1000 };
// Properties of the Markers
interface Position {
  lat: number,
  lng: number
}

// Properties of the infoWindow
interface PointOfInterest {
  position: Position,
  id: number,
  name: string,
  description: string,
  image: string
}

//State of the map
interface MapsPageState {
  pointsOfInterest: Array<PointOfInterest>, //
  infoWindowPoI?: PointOfInterest, //the last marker clicked in the array, then this infoWindowPoI gets updated.
  showInfoWindow: boolean, //decide to display the infoWindow
  currentLocation: any,
  response: any,
  waterSites: any[],
  selectedSite: any
}

//Style of the map
const containerStyle = {
  width: '1000px',
  height: '500px'
}



//Style of the infoWindow
const divStyle = {
  background: `white`,
  border: `none`,
  padding: 10
};

const image =
    "http://maps.google.com/mapfiles/ms/icons/blue-dot.png";

const image1 =
    "http://maps.google.com/mapfiles/ms/icons/red-dot.png";

// Occurs when an object/infoWindow has been loaded
const onLoad = (infoWindow: any) => {
  console.log('infoWindow: ', infoWindow)
};

export class MapsPage extends React.Component<{}, MapsPageState> {

  constructor(props: any, state: any) {
    super(props, state);

    this.state = {
      pointsOfInterest: locations.locations,
      showInfoWindow: false,
      currentLocation: {},
      response: null,
      waterSites: [],
      selectedSite: {}
    };

    this.directionsCallback = this.directionsCallback.bind(this)
  };

  componentDidMount() {
    if (Object.keys(this.state.currentLocation).length === 0) {
      navigator.geolocation.getCurrentPosition((position) => {
        this.setState({
          currentLocation: {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          }
        })
      });
    }

    fetch("https://waterservices.usgs.gov/nwis/gwlevels/?format=json&stateCd=az&siteType=GW&siteStatus=active")
      .then(response => response.json())
      .then(data =>
        //console.log(data)
        this.setState({
          waterSites: data.value.timeSeries
        })
  
      )
     .catch(error => console.log(error))
  }

  directionsCallback(response: any) {
    console.log(response)

    if (response !== null) {
      if (response.status === 'OK') {
        this.setState(
          () => ({
            response: response
          })
        )
      } else {
        console.log('response: ', response)
      }
    }
  }

  private updateSite = (site: any) => {
    this.setState({ 
      selectedSite: site,
      showInfoWindow: true 
    }); //sets the infoWindowPoI to the value of the current marker, says that the infoWindow should be displayed
  }

  render() {
    //Makes it easier to call state value - This way we don't have to type this.state every time
    const { currentLocation, showInfoWindow, pointsOfInterest, infoWindowPoI, selectedSite } = this.state;
    console.log(selectedSite)
    console.log("The current location is")
    console.log(currentLocation)

    
    //let firstLoc = pointsOfInterest[0]//TODO

    //Position where the map is displayed
    const center = {
      //Average lat and long of current location and first in location data to calculate
      lat: 40.744624,
      lng: -73.888128
    };

    let directionsService;
    let infoWindow;
    if (showInfoWindow) {
      directionsService = 
        <DirectionsService
          // required
          options={{
            destination: {
              lat: selectedSite.sourceInfo.geoLocation.geogLocation.latitude,
              lng: selectedSite.sourceInfo.geoLocation.geogLocation.longitude
            },
            origin: currentLocation,
            travelMode: "WALKING"
          }}
          // required
          callback={this.directionsCallback}
          // optional
          onLoad={directionsService => {
            console.log('DirectionsService onLoad directionsService: ', directionsService)
          }}
          // optional
          onUnmount={directionsService => {
            console.log('DirectionsService onUnmount directionsService: ', directionsService)
          }}
        />

      infoWindow =
        <InfoWindow
          onLoad={onLoad}
          onCloseClick={() => { this.setState({ showInfoWindow: false }) }} //Keeps infoWindow closed before Click
          position={{
            lat: selectedSite.sourceInfo.geoLocation.geogLocation.latitude,
            lng: selectedSite.sourceInfo.geoLocation.geogLocation.longitude
          }} //Puts infoWindow on poistion
        >
          <div style={divStyle}>
          <p>{selectedSite.sourceInfo.siteName}</p>
            <p>{
            //this.state.infoWindowPoI?.description
          }</p>
          </div>
        </InfoWindow>;
    } else {
      infoWindow = null;
      directionsService = null;
    }

    return (
      <div>
        <h1>Maps Page</h1>
        <Stack tokens={stackTokens}>
          <SearchBox placeholder="Search for Locations" onSearch={(newValue :any) => console.log('value is ' + newValue)} />
        </Stack>
        <p></p>
        <LoadScript
          googleMapsApiKey="AIzaSyBRggqX867X31WZeHBREbQaIFypEyNLbJE"
        >
          <GoogleMap
            mapContainerStyle={containerStyle}
            center={center}
            zoom={15}
          >
            {
              Object.keys(currentLocation).length != 0 ?
                <Marker
                  key="currentLocation"
                  position={currentLocation}
                  icon={image}
                />
              :
                null
            }
            

            {this.state.waterSites.map((site: any, index: number) => (
              <Marker
                key={index} //each marker has a key, and thid iteration is one key
                position={{
                  lat: site.sourceInfo.geoLocation.geogLocation.latitude,
                  lng: site.sourceInfo.geoLocation.geogLocation.longitude
                }}
                onClick={() => this.updateSite(site)} 
                icon={image1}
              />
            ))}

            {infoWindow}
            {directionsService}
            {
              this.state.response !== null && (
                <DirectionsRenderer
                  // required
                  options={{
                    directions: this.state.response
                  }}
                  // optional
                  onLoad={directionsRenderer => {
                    console.log('DirectionsRenderer onLoad directionsRenderer: ', directionsRenderer)
                  }}
                  // optional
                  onUnmount={directionsRenderer => {
                    console.log('DirectionsRenderer onUnmount directionsRenderer: ', directionsRenderer)
                  }}
                />
              )
            }
          </GoogleMap>
        </LoadScript>
      </div>
    );
  }
}

{/* Use for the PopUpPage <p onClick={(e) => this.props.changePage(pages.DirectionPage)}>Directions</p> */ }
