import React from "react";
import { MapContainer, TileLayer, useMap } from "react-leaflet";
import { showDataOnMap } from "../../utils/utils";
import "./Map.css";
const Map = ({ countries, casesTypes, center, zoom }) => {
  const ChangeView = ({ center, zoom }) => {
    const map = useMap();
    map.setView(center, zoom);
    return null;
  };
  return (
    <div className="map">
      <MapContainer casesTypes={casesTypes} center={center} zoom={zoom}>
        <ChangeView center={center} zoom={zoom} />
        <TileLayer
          attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {showDataOnMap(countries, casesTypes)}
      </MapContainer>
    </div>
  );
};

export default Map;
