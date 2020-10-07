import React, { useState, useEffect } from 'react';
import './App.css';
import { MenuItem, FormControl, Select, Card, CardContent } from "@material-ui/core"
import InfoBox from './InfoBox';
import Map from './Map'
import Table from './Table'
import { sortData, prettyPrintStat } from './util'
import LineGraph from './LineGraph';
import "leaflet/dist/leaflet.css"
import numeral from "numeral";

function App() {

  const [countries, setCountries]= useState([]);
  const [country, setCountry]= useState("worldwide");
  const [countryInfo, setCountryInfo] = useState({});
  const [tableData, setTableData] = useState([]);
  const [casesType, setCasesType] = useState("cases");
  const [mapCenter, setMapCenter] = useState([34,-40]);
  const [mapZoom , setMapZoom] = useState(3);
  const [mapCountries, setMapCountries] = useState([]);
  useEffect(() => {
    fetch("https://disease.sh/v3/covid-19/all")
    .then(response => response.json())
    .then(data => {
      setCountryInfo(data);
    })
  },[])
  // https://disease.sh/v3/covid-19/countries
  useEffect(() => {
    const getCountriesData = async () => {
      await fetch("https://disease.sh/v3/covid-19/countries")
      .then((response) => response.json())
      .then((data) => {
        const countries = data.map(country => (
          {
            name: country.country,
            value: country.countryInfo.iso2
          }
        ))
        const sortedData = sortData(data);
        setTableData(sortedData);
        setMapCountries(data);
        setCountries(countries);
      });
    };
    getCountriesData();
  },[]);
 
  const onCountryChange = async (event) => {
    const countryCode = event.target.value;
    setCountry(countryCode);
      
    // https://disease.sh/v3/covid-19/all
    // https://disease.sh/v3/covid-19/countries/[Country-Code]
    const url = countryCode === 'worldwide' ? 'https://disease.sh/v3/covid-19/all' : `https://disease.sh/v3/covid-19/countries/${countryCode}`
    await fetch(url)
    .then(response => response.json())
    .then(data => {
      setCountryInfo(data);
      console.log("New Country Data>>>",data);
      // setMapCenter([data.countryInfo.lat,data.countryInfo.long])
      countryCode === 'worldwide' ? setMapCenter([34,-40]) : setMapCenter([data.countryInfo.lat,data.countryInfo.long]);

      console.log("zoom called");
      setMapZoom(4);
    })
  };
  console.log(mapCenter);
  return (
    <div className="App">
      <div className="app_left">
          <div className="app_header">
            <h1>COVID-19 TRACKER</h1>
            <FormControl className="app_dropdown">
              <Select
                variant="outlined"
                value={country}
                onChange={onCountryChange}
              >
              <MenuItem value="worldwide">Worldwide</MenuItem>
              { countries.map(country => (
                <MenuItem value={country.value}>{country.name}</MenuItem>
              ))}
              </Select>              
            </FormControl>
          </div>
          <div className="app_stats">
            <InfoBox
              isRed
              active={casesType === "cases"}
              title="Coronavirus Cases"
              cases={prettyPrintStat(countryInfo.todayCases)}
              total={numeral(countryInfo.cases).format("0.0a")}
              onClick={(e) => setCasesType("cases")} />
            <InfoBox
              active={casesType === "recovered"}
              title="Recovered"
              cases={prettyPrintStat(countryInfo.todayRecovered)}
              total={numeral(countryInfo.recovered).format("0.0a")}
              onClick={(e) => setCasesType("recovered")} />
            <InfoBox
              isRed
              active={casesType === "deaths"}
              title="Deaths"
              cases={prettyPrintStat(countryInfo.todayDeaths)}
              total={numeral(countryInfo.deaths).format("0.0a")}
              onClick={(e) => setCasesType("deaths")} />
          </div>
          <Map countries={mapCountries} casesType={casesType} center={mapCenter} zoom={mapZoom} />
      </div>
      <Card className="app_right">
        <CardContent>
          <h3>Live Cases By Country</h3>
          <Table countries={tableData} />
          <h3 className="app_graphTitle">WorldWide New {casesType}</h3>
          <LineGraph className="app_graph" casesType={casesType} />
        </CardContent>
      </Card>
    </div>
  );
}

export default App;
