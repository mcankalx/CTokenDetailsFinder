class Form {
  constructor() {
    this.addressForm = document.querySelector('.form');
    this.addressInput = document.querySelector('.form__input');
    this.assets = document.querySelector('.asset-list');
    this.error = document.querySelector('.error');
	
  }

  _XHRRequest(url, callback) {
    const xhr = new XMLHttpRequest();
    try{
    xhr.open('GET', url, true);
    xhr.send();
	}
	catch(e){
          alert("Callback Exception caught!");
      }
    console.log(xhr.status);
    xhr.onreadystatechange = (e) => {
		console.log(xhr.readyState);
      if (xhr.readyState == 4 && xhr.status == 200) {
        if(document.querySelector('.spinner')) {
           const spinner = document.querySelector('.spinner');
		   


        }
        callback(xhr.responseText);
      } else if(xhr.status == 500) {
		  this.error.style.display = 'block';
      }
    }
  }

  
  _commafy(num) {
    var str = num.toString().split('.');
    if (str[0].length >= 5) {
        str[0] = str[0].replace(/(\d)(?=(\d{3})+$)/g, '$1,');
    }
    if (str[1] && str[1].length >= 5) {
        str[1] = str[1].replace(/(\d{3})/g, '$1 ');
    }
    return str.join('.');
  }

  

  onSubmit() {
    this.addressForm.addEventListener('submit', (e) => {
      e.preventDefault();

      // Remove old assets
      const oldAssets = document.querySelectorAll('.asset');
      oldAssets.forEach(asset => {
        asset.parentNode.removeChild(asset);
      });

      // Remove old error message
      this.error.style.display = 'none';
    
      const address = this.addressInput.value;
      
      //const addressUrl = `https://api.compound.finance/api/v2/account?addresses[]=${address}`;
	  const tokenUrl = `https://localhost/wallet-balance/ceth/?address=${address}`;
		const spinner = document.createElement('div');
        spinner.className = 'spinner';
        this.assets.append(spinner);
      console.log('URL: ', tokenUrl);
      this._XHRRequest(tokenUrl, (response) => {
        

        const data = JSON.parse(response);
        console.log('Data: ', data);

        if(data.Balances.length < 1) {
          spinner.parentNode.removeChild(spinner);
          this.error.style.display = 'block';
          return;
        }
		else{
			spinner.parentNode.removeChild(spinner);
		}
        
        
        for(let i = 0; i < data.Balances.length; i++) {
          //const tokenUrl = `https://api.compound.finance/api/v2/ctoken?addresses[]=${tokenArray[i].address}`;

            const tokenData = data.Balances[i];
            
            console.log('Token Data: ', tokenData);

            // Create asset box
            const asset = document.createElement('div');
            asset.className = 'asset';
            this.assets.appendChild(asset);

            // Create asset header
            const header = document.createElement('div');
            header.className = 'asset__header';
            asset.appendChild(header);

			// Add icon
            const icon = document.createElement('img');
            icon.className = 'asset__icon'
            icon.src = `../images/${tokenData.cTokenName.slice(1)}.svg`;
            header.appendChild(icon);
           
            // Add name
            const name = document.createElement('h4');
            name.className = 'asset__name';
            name.innerHTML = tokenData.cTokenName;
            header.appendChild(name);

           
            // Create asset supply value container
            const assetSupplyBorrowValues = document.createElement('div');
            assetSupplyBorrowValues.className = 'asset__values asset__values--supply asset__values--active';
            asset.appendChild(assetSupplyBorrowValues);

            // Add interest rate
            const supplyInterestRate = document.createElement('p');
            supplyInterestRate.className = 'asset__value';
            supplyInterestRate.innerHTML = `<strong>Supply APY Rate:</strong> ${tokenData.SupplyAPY}% APR`;
            assetSupplyBorrowValues.appendChild(supplyInterestRate);

            // Add balance
            const borrowInterestRate = document.createElement('p');
            borrowInterestRate.className = 'asset__value';
            borrowInterestRate.innerHTML = `<strong>Borrow APY Rate:</strong> ${tokenData.BorrowAPY}% APR`;
            assetSupplyBorrowValues.appendChild(borrowInterestRate);

            // Add earned interest
            const tokenBalance = document.createElement('p');
            tokenBalance.className = 'asset__value';
            tokenBalance.innerHTML = `<strong>Balance:</strong> ${tokenData.Balance}`;
            assetSupplyBorrowValues.appendChild(tokenBalance);

            // Add yearly interest
            const redeemRate = document.createElement('p');
            redeemRate.className = 'asset__value';
            redeemRate.innerHTML = `<strong>Redeem Rate:</strong> ${tokenData.RedeemRate}`;
            assetSupplyBorrowValues.appendChild(redeemRate);

			// Add yearly interest
            const underlyingBalance = document.createElement('p');
            underlyingBalance.className = 'asset__value';
            underlyingBalance.innerHTML = `<strong>Balance Of Underlying:</strong> ${tokenData.BalanceOfUnderlying}`;
            assetSupplyBorrowValues.appendChild(underlyingBalance);
           
          
        }
      });
    });
  }
}

const form = new Form();
form.onSubmit();