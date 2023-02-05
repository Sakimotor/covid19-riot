function makeData() {
	const ttl = 21600000

	let data = {

		getDate() {
			let cacheDate = JSON.parse(localStorage.getItem('Date')) || [];
			if (cacheDate.length < 1) {
				this.RequestAPI("https://api.covid19api.com/summary", "summary");
				return null;
			}
			else {
				let date = cacheDate.value.substring(0, 10);
				let temp = date.split('-');
				date = temp[2] + "/" + temp[1] + "/" + temp[0];
				return date;
			}
		},

		getHeure() {
			let cacheDate = JSON.parse(localStorage.getItem('Date')) || [];
			if (cacheDate.length < 1) {
				this.RequestAPI("https://api.covid19api.com/summary", "summary");
				return null;
			}
			else {
				let date = cacheDate.value.substring(11, 19);
				return date;
			

		}
	},

	getExpiry(){
		let cacheDate = JSON.parse(localStorage.getItem('Date')) || [];
			if (cacheDate.length < 1) {
				this.RequestAPI("https://api.covid19api.com/summary", "summary");
				return null;
			}
			else {
				let date = new Date(cacheDate.expiry -ttl);
				return (String(date.getDate()).padStart(2, '0') +"/" + String(date.getMonth() + 1).padStart(2, '0') + "/" + date.getFullYear());
			}

	},

	getExpiryHeure(){
		let cacheDate = JSON.parse(localStorage.getItem('Date')) || [];
			if (cacheDate.length < 1) {
				this.RequestAPI("https://api.covid19api.com/summary", "summary");
				return null;
			}
			else {
				let date = new Date(cacheDate.expiry  -ttl);
				return (String(date.getHours()).padStart(2, '0') + ":" +String(date.getMinutes()).padStart(2, '0') + ":"+ String(date.getSeconds()).padStart(2, '0') );
			}

	},


		getData(string) {
			let data_chunk = JSON.parse(localStorage.getItem(string)) || []
			let date = new Date()
			if (typeof data_chunk === 'undefined' || data_chunk.value === null || data_chunk.length < 1) {
				localStorage.removeItem(string)
				this.RequestAPI("https://api.covid19api.com/summary", "summary");

			}
			if (date.getTime() > data_chunk.expiry) {
				localStorage.removeItem(string)
				this.RequestAPI("https://api.covid19api.com/summary", "summary");

			}
			return data_chunk.value;
		},


		getDataAll() {
			let dataAll = [];

			for (let donnee in localStorage) {
				try {
				if (typeof localStorage[donnee] !== "function" && donnee !== 'length') {
					dataAll[donnee] = JSON.parse(localStorage.getItem(donnee)).value;
				}
			} catch(e){
				
			}
			}
			return dataAll;


		},

		checkExpire(donnee, url, type){
			let date = new Date()
			let array = JSON.parse(localStorage[donnee]);
			if (date.getTime() > array.expiry) {
				localStorage.removeItem(donnee)
				this.RequestAPI(url, type);
				console.log("expiration summary");

			}


		},

		getDataSummary() {
			let dataSummary = [];
			let compteur = 0;
			for (let donnee in localStorage) {
				try {
					JSON.parse(localStorage.getItem(donnee));
					if (JSON.parse(localStorage.getItem(donnee)) !== null && JSON.parse(localStorage.getItem(donnee)).categorie == "summary") {
						compteur = compteur + 1;
						let array = JSON.parse(localStorage[donnee]);
						this.checkExpire(donnee, "https://api.covid19api.com/summary", "summary");
						dataSummary[donnee] = array.value;
					}
				} catch (e) {
				}


			}
			if (compteur == 0) this.RequestAPI("https://api.covid19api.com/summary", "summary");
			return dataSummary;


		},

		getDataPays(p, country) {
			let storage = "Detail" + country;
			let data_chunk = JSON.parse(localStorage.getItem(storage)) || []
			let date = new Date()
			if (typeof data_chunk === 'undefined' || data_chunk.value === null || data_chunk.length < 1) {
				localStorage.removeItem(storage)
				this.RequestAPI("https://api.covid19api.com/country/" + p, "paysDetail");

			}
			if (date.getTime() > data_chunk.expiry) {
				localStorage.removeItem(storage)
				this.RequestAPI("https://api.covid19api.com/country/" + p, "paysDetail");

			}
			return data_chunk.value;

		},

		ListePays(){
			let dataPays = [];
			let compteur = 0;
			for (let donnee in localStorage) {
				try {
					JSON.parse(localStorage.getItem(donnee));
					if (JSON.parse(localStorage.getItem(donnee) !== null && JSON.parse(localStorage.getItem(donnee)).categorie === "pays" ))  {
						compteur = compteur + 1;
						let array = JSON.parse(localStorage[donnee]);
						this.checkExpire(donnee, "https://api.covid19api.com/summary", "pays");	
						dataPays[donnee] = array.value; 
					}
				} catch (e) {
				}

			}
			if (compteur < 1) this.RequestAPI("https://api.covid19api.com/summary", "pays");
			return dataPays;
		},

		getListePays(){
			return this.ListePays();

		},

		reloadPage(){
			console.log("reload");
			location.reload();
		},


		async RequestAPI(url, c) {
			let cat = c;
			let p = new Promise((resolve, reject) => {

				let xhr = new XMLHttpRequest()
				xhr.open("GET", url)
				xhr.responseType = "json"

				xhr.onload = () => {
					if (xhr.status >= 200 && xhr.status < 300) {
						if(cat == "summary") resolve(xhr.response.Global);
						else  if (cat == "pays") 	resolve(xhr.response.Countries);
						else  if (cat == "paysDetail") 	resolve(xhr.response);
						console.log("requete api");



					} else {
						reject(1)
					}
				}

				xhr.onerror = () => {
					reject(2)
				}

				xhr.timeout = 10000
				xhr.ontimeout = () => {
					reject(3)
				}
				xhr.send()


			})

			p.then(
				function setData(res) {
					const date = new Date()
					if (cat == "pays") {

						for (let object in res) {
							const statsImportantes = {
								Country : res[object].Country,
								newDeaths : res[object].NewDeaths,
								newConfirmed : res[object].NewConfirmed,
								newRecovered : res[object].NewRecovered,
								totalDeaths : res[object].TotalDeaths,
								totalConfirmed : res[object].TotalConfirmed,
								totalRecovered : res[object].TotalRecovered,
								slug : res[object].Slug
							}

							let store = res[object].Country;
							const obj = {

								categorie : cat,
								value: statsImportantes,
								expiry: date.getTime() + ttl
							}
							localStorage.setItem(store, JSON.stringify(obj));



						}

					}
					else if( cat == "paysDetail") {

							let CountryInfo = res[0].Country;
							let ConfirmedInfo = [];
							let DeathsInfo = [];
							let ActiveInfo = [];
							let ProvinceInfo = []
							let RecoveredInfo = [];
							let DatesInfo = [];
							for (let object in res) {
								ConfirmedInfo.push(res[object].Confirmed);
								DeathsInfo.push(res[object].Deaths);
								ActiveInfo.push(res[object].Active);
								RecoveredInfo.push(res[object].Recovered);
								DatesInfo.push(res[object].Date);
								ProvinceInfo.push(res[object].Province);
								
						} 
							const statsImportantes = {
								Country : CountryInfo,
								Confirmed : ConfirmedInfo,
								Deaths : DeathsInfo,
								Recovered : RecoveredInfo,
								Active : ActiveInfo,
								Date : DatesInfo,
								Province : ProvinceInfo
							}

							let store = "Detail" + CountryInfo;
							const obj = {

								categorie : cat,
								value: statsImportantes,
								expiry: date.getTime() + ttl
							}
							console.log(obj)
							localStorage.setItem(store, JSON.stringify(obj));
						}






				
					else {
						for (let object in res) {
							const obj = {
								categorie : cat,
								value: res[object],
								expiry: date.getTime() + ttl
							}
							localStorage.setItem(object, JSON.stringify(obj));

						}



					}
					data.reloadPage();


				})

		}





	}

	return data;
}
