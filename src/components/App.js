import React, { useState, useEffect } from 'react'
import { Card, CardContent, FormControl, MenuItem, Select } from '@material-ui/core';
import '../css/App.css';
import InfoBox from './InfoBox';
import Map from './Map';
import Table from './Table'
import { prettyPrintStat, sortData } from '../util';
import LineGraph from './LineGraph';
import "leaflet/dist/leaflet.css";
import numeral from 'numeral'
function App() {

  //hooks
  const [countries, setCountries] = useState([]);
  const [country, setInputCountry] = useState("worldwide");
  const [countryInfo, setCountryInfo] = useState({});
  const [tableData, setTableData] = useState([]);
  const [mapCenter, setMapCenter] = useState({ lat: 34.80746, lng: -40.4796 });
  const [mapZoom, setMapZoom] = useState(3);
  const [mapCountries, setMapCountries] = useState([]);
  const [casesType, setCasesType] = useState("cases");

  //API call to get country information, here we collect names
  useEffect( () => {

    const getCountriesData = async () => {
      fetch("https://disease.sh/v3/covid-19/countries")
        .then((response) => response.json())
        .then((data) => {
          const countries = data.map((country) => ({
            name: country.country,
            value: country.countryInfo.iso2,
          }));
          
          let sortedData = sortData(data);
          setCountries(countries);
          setMapCountries(data);
          setTableData(sortedData);
        });
    };

    getCountriesData();

  }, []);
  
  //fetch when site loads, default fetch
  useEffect(() => {
    fetch("https://disease.sh/v3/covid-19/all")
      .then((response) => response.json())
      .then((data) => {
        setCountryInfo(data);
      });
  }, []);

  //handle selecting of country and fetching country data
  const onCountryChange = async (event) => {
    const countryCode = event.target.value;
    setInputCountry(countryCode);
    const url =
      countryCode === "worldwide"
        ? "https://disease.sh/v3/covid-19/all"
        : `https://disease.sh/v3/covid-19/countries/${countryCode}`;

    
        await fetch(url)
        .then((response) => response.json())
        .then((data) => {
          setInputCountry(countryCode);
          setCountryInfo(data);
          (countryCode!=="worldwide") && setMapCenter([data.countryInfo.lat, data.countryInfo.long]);
          setMapZoom(4);
        });
  }

  return (
    <div className="app">
      <div className="app__left">
        <div className="app__header">
          <h1>COVID-19 TRACKER</h1>

          {/* dropdown menu */}
          <FormControl className="app__dropdown">
            
            <Select variant = "outlined" value ={country} onChange={onCountryChange}>
              <MenuItem value="worldwide">Worldwide</MenuItem>
              {
                countries.map( country => (<MenuItem value={country.value}>{country.name}</MenuItem>))
              }
            </Select>
          </FormControl>
        </div>
        
        <div className="app__stats">

          <InfoBox
           title="Coronavirus Cases"
           cases={prettyPrintStat(countryInfo.todayCases)} 
           total={numeral(countryInfo.cases).format("0.0a")}
           onClick={(e) => setCasesType("cases")}
           active={casesType === "cases"}
           isRed={true}
            />
          <InfoBox 
          title="Recovered" 
          cases={prettyPrintStat(countryInfo.todayRecovered)} 
          total={numeral(countryInfo.recovered).format("0.0a")}
          onClick={(e) => setCasesType("recovered")}
          active={casesType === "recovered"}
          isRed={false}
          />
          <InfoBox 
          title="Death" 
          cases={prettyPrintStat(countryInfo.todayDeaths)} 
          total={numeral(countryInfo.deaths).format("0.0a")}
          onClick={(e) => setCasesType("deaths")}
          active={casesType === "deaths"}
          isRed={true}
          />

        </div>

        {/* map */}
        <Map
          casesType={casesType}
          countries={mapCountries}
          center={mapCenter}
          zoom={mapZoom}
        />
      </div>
      
      <Card className="app__right">
        <CardContent>
            <div className="app__information">
              <h3>Live Cases by Country</h3>
              <Table countries={tableData} />

              <h3>Worldwide new {casesType}</h3>
              <LineGraph className="app__graph" casesType={casesType}/>
            </div>
          </CardContent>
      </Card>
    </div>
  );
}

export default App;
