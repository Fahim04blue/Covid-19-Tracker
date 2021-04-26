import React, { useState } from "react";
import FormControl from "@material-ui/core/FormControl";
import Select from "@material-ui/core/Select";
import MenuItem from "@material-ui/core/MenuItem";
import "./CovidTracker.css";
import { useEffect } from "react";
import InfoBox from "../InfoBox/InfoBox";
import Map from "../Map/Map";
import "leaflet/dist/leaflet.css";
import {
  Card,
  CardContent,
  createMuiTheme,
  ThemeProvider,
  CssBaseline,
  withStyles,
} from "@material-ui/core";
import TableData from "../TableData/TableData";
import { prettyPrintStat, sortData, useLocalStorage } from "../../utils/utils";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Switch from "@material-ui/core/Switch";
import Graph from "../Graph/Graph";
import Tooltip from "@material-ui/core/Tooltip";

const LightTooltip = withStyles((theme) => ({
  tooltip: {
    backgroundColor: theme.palette.common.white,
    color: "rgba(0, 0, 0, 0.87)",
    boxShadow: theme.shadows[1],
    fontSize: 13,
    padding: 10,
  },
}))(Tooltip);

const DarkTooltip = withStyles((theme) => ({
  tooltip: {
    color: "white",
    maxWidth: 220,
    fontSize: 13,
    padding: 10,
  },
}))(Tooltip);
const CovidTracker = () => {
  const [countries, setCountries] = useState([]);
  const [country, setCountry] = useState("global");
  const [countryInfo, setCountryInfo] = useState({});
  const [tableData, setTableData] = useState([]);
  const [casesTypes, setCasesTypes] = useState("cases");
  const [mapCenter, setMapCenter] = useState({ lat: 23.685, lng: 90.3563 });
  const [mapZoom, setMapZoom] = useState(4);
  const [mapCountries, setMapCountries] = useState([]);
  const [dark, setDark] = useLocalStorage(false);
  const theme = createMuiTheme({
    palette: {
      type: dark ? "dark" : "light",
    },
  });
  useEffect(() => {
    const getAllCountryData = async () => {
      try {
        const response = await fetch("https://disease.sh/v3/covid-19/all");
        const results = await response.json();
        setCountryInfo(results);
      } catch (error) {
        console.error(error);
      }
    };
    getAllCountryData();
  }, []);

  useEffect(() => {
    const getCountriesData = async () => {
      try {
        const response = await fetch(
          "https://disease.sh/v3/covid-19/countries"
        );
        const results = await response.json();
        console.log(results);
        const sortedData = sortData(results);
        setTableData(sortedData);
        setMapCountries(results);
        setCountries(results);
      } catch (error) {
        console.error(error);
      }
    };
    getCountriesData();
  }, []);

  const handleChange = async (e) => {
    const countryName = e.target.value;
    const url =
      countryName === "global"
        ? "https://disease.sh/v3/covid-19/all"
        : `https://disease.sh/v3/covid-19/countries/${countryName}`;

    try {
      const response = await fetch(url);
      const results = await response.json();
      setCountry(countryName);
      setCountryInfo(results);
      console.log([results.countryInfo.lat, results.countryInfo.long]);
      countryName === "global"
        ? setMapCenter([23.685, 90.3563])
        : setMapCenter([results.countryInfo.lat, results.countryInfo.long]);
      setMapZoom(4);
    } catch (error) {
      console.error(error);
    }
  };

  console.log("Country Info", countryInfo);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <div className="tracker">
        <div className="tracker__left">
          <div className="tracker__header">
            <h1>COVID-19 TRACKER</h1>

            <FormControl className="tracker__dropdown">
              <Select
                variant="outlined"
                value={country}
                onChange={handleChange}
              >
                <MenuItem value="global">Global </MenuItem>
                {countries.map((country) => (
                  <MenuItem value={country.countryInfo.iso2}>
                    {country.country}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </div>
          {dark ? (
            <LightTooltip title="Disable Dark Mode">
              <FormControlLabel
                style={{ marginBottom: "10px" }}
                control={
                  <Switch
                    checked={dark}
                    onChange={() => setDark(!dark)}
                    color="default"
                  />
                }
              />
            </LightTooltip>
          ) : (
            <DarkTooltip
              style={{ fontSize: 13, padding: 10 }}
              title="Enable Dark Mode"
            >
              <FormControlLabel
                style={{ marginBottom: "10px" }}
                control={
                  <Switch
                    checked={dark}
                    onChange={() => setDark(!dark)}
                    color="default"
                  />
                }
              />
            </DarkTooltip>
          )}

          <div className="tracker__stats">
            <InfoBox
              isRed
              active={casesTypes === "cases"}
              onClick={(e) => setCasesTypes("cases")}
              title="Coronavirus Cases"
              cases={prettyPrintStat(countryInfo.todayCases)}
              total={prettyPrintStat(countryInfo.cases)}
            />
            <InfoBox
              active={casesTypes === "recovered"}
              onClick={(e) => setCasesTypes("recovered")}
              title="Recovered"
              cases={prettyPrintStat(countryInfo.todayRecovered)}
              total={prettyPrintStat(countryInfo.recovered)}
            />
            <InfoBox
              isGrey
              active={casesTypes === "deaths"}
              onClick={(e) => setCasesTypes("deaths")}
              title="Deaths"
              cases={prettyPrintStat(countryInfo.todayDeaths)}
              total={prettyPrintStat(countryInfo.deaths)}
            />
          </div>
          <Map
            countries={mapCountries}
            center={mapCenter}
            zoom={mapZoom}
            casesTypes={casesTypes}
          />
        </div>
        <Card className="tracker__right">
          <CardContent>
            <h3>Live Cases by Country</h3>
            <TableData countries={tableData} />
            <h3 style={{ marginTop: "20px" }}>Global New {casesTypes}</h3>
            <Graph className="tracker__chart" casesTypes={casesTypes} />
          </CardContent>
        </Card>
      </div>
    </ThemeProvider>
  );
};

export default CovidTracker;
