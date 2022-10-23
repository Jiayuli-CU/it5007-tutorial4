
const dateRegex = new RegExp('^\\d\\d\\d\\d-\\d\\d-\\d\\d');
function jsonDateReviver(key, value) {
	if (dateRegex.test(value)) {
		return new Date(value);
	}
	return value;
}

async function graphQLFetch(query, variables = {}) {
	try {
		const response = await fetch('/graphql', {
		method: 'POST',
			headers: { 'Content-Type': 'application/json'},
			body: JSON.stringify({ query, variables })
		});
		const body = await response.text();
		const result = JSON.parse(body, jsonDateReviver);

		if (result.errors) {
			const error = result.errors[0];
			if (error.extensions.code == 'BAD_USER_INPUT') {
				const details = error.extensions.exception.errors.join('\n ');
				alert(`${error.message}:\n ${details}`);
			} else {
				alert(`${error.extensions.code}: ${error.message}`);
			}
		}
		return result.data;
	} catch (e) {
		alert(`Error in sending data to server: ${e.message}`);
	}
}

function TravellerRow(props) {
	const traveller = props.traveller;
	return (
		<tr>
			<td>{traveller.id}</td>
			<td>{traveller.name}</td>
			<td>{traveller.phone}</td>
			<td>{traveller.seat}</td>
			<td>{traveller.bookingTime.toDateString()}</td>
		</tr>
	);
}

function Display(props) {
	const travellerRows = props.travellers.map(i =>
		<TravellerRow key={i.id} traveller={i} />
	);

	return (
		<table className="bordered-table">
		<thead>
			<tr>
			<th>ID</th>
			<th>Name</th>
			<th>Phone</th>
			<th>Seat</th>
			<th>Booking Time</th>
			</tr>
		</thead>
		<tbody>
			{travellerRows}
		</tbody>
		</table>
	);
}

class Add extends React.Component {
	constructor() {
		super();
		this.handleSubmit = this.handleSubmit.bind(this);
	}

	inBlacklist(form) {
		const blacklist = this.props.blacklist;
		const passenger = {
			name: form.travellername.value, 
			phone: form.travellerphone.value,
		}
		for (let i = 0; i < blacklist.length; i++) {
			if (JSON.stringify(blacklist[i]) == JSON.stringify(passenger)) {
				return true;
			}
		}
		return false;
	}

	handleSubmit(e) {
		e.preventDefault();
		// if (this.props.travellers.length == 10) {
		// 	alert("All seats have already been taken");
		// }
		const form = document.forms.addTraveller;
		const passenger = {
			name: form.travellername.value, 
			phone: form.travellerphone.value,
			seat: form.travellerseat.value,
			bookingTime: Date.now(),
		}
		this.props.bookTraveller(passenger);
		form.travellername.value = ""; 
		form.travellerphone.value = "";
		form.travellerseat.value = "";
	}

	render() {
		return (
			<form name="addTraveller" onSubmit={this.handleSubmit}>
				<input type="text" name="travellername" placeholder="Name" />
				<input type="text" name="travellerphone" placeholder="Phone Number" />
				<input type="text" name="travellerseat" placeholder="Seat" />
				<button>Add</button>
			</form>
		);
	}
}


class Delete extends React.Component {
	constructor() {
		super();
		this.handleSubmit = this.handleSubmit.bind(this);
	}

	handleSubmit(e) {
		e.preventDefault();
		const form = document.forms.deleteTraveller;
		const passenger = {
			name: form.travellername.value,
		}
		this.props.deleteTraveller(passenger);
		form.travellername.value = "";
	}

	render() {
		return (
			<form name="deleteTraveller" onSubmit={this.handleSubmit}>
				<input type="text" name="travellername" placeholder="Name" />
				<button>Delete</button>
			</form>
		);
	}
}

/*Q4. Placeholder for Blacklist component
 * - This component should create a form to accept user input (name of traveller). 
 * - The submit handler should make a call to blacklistTraveller() function with the 
 *   right parameters.
 * - Make sure to invalidate/clear the form input fileds in the UI during cleanup.*/
class Blacklist extends React.Component {
	constructor() {
		super();
		this.handleSubmit = this.handleSubmit.bind(this);
	}

	handleSubmit(e) {
		e.preventDefault();
		const form = document.forms.addBlacklistTraveller;
		const passenger = {
			name: form.travellername.value,
			phone: form.travellerphone.value,
		};
		this.props.blacklistTraveller(passenger);
		form.travellername.value = "";
		form.travellerphone.value = "";
	}

	render() {
		return (
			<form name="addBlacklistTraveller" onSubmit={this.handleSubmit}>
				<input type="text" name="travellername" placeholder="Name" />
				<input type="text" name="travellerphone" placeholder="Phone Number" />
				<button>Add to Blacklist</button>
			</form>
		);
	}
}

/*End of Q4*/


class Homepage extends React.Component {
	constructor() {
		super();
	}

	render() {
		return (
			<div>
				<h5>Online Ticket Reservation Portal</h5>
			</div>
		);
	}
}

class TicketToRide extends React.Component {
	constructor() {
		super();
		this.state = { 
			travellers: [], 
			blacklist: [],
			selector: 1,
		};
		this.bookTraveller = this.bookTraveller.bind(this);
		this.deleteTraveller = this.deleteTraveller.bind(this);
		this.blacklistTraveller = this.blacklistTraveller.bind(this);
	}

	setSelector(value) {
		this.setState({selector: value});
	}

	componentDidMount() {
		this.loadData();
		this.loadBlacklistData();
	}

	async loadData() {
		/*Q3: Write code for GraphQL API call to fetch list of travellers
		* - Write the query
		* - Make a call to graphQLFetch with parameter: query
		* - Post process data and take some action (e.g., re-load UI)  */
		const query = `query {
			listTravellers {
				id name phone seat bookingTime
			}
		}`;

		const res = await graphQLFetch(query);
		if (res) {
			this.setState({travellers: res.listTravellers});
		}

		/*End of Q3*/
	}

	async loadBlacklistData() {
		const query = `query {
			listBlacklistTravellers {
				name phone
			}
		}`;

		const res = await graphQLFetch(query);
		if (res) {
			this.setState({blacklist: res.listBlacklistTravellers});
		}
	}

	async bookTraveller(ticket) {
		/*Q3: Write code for GraphQL API call to add a traveller
		* - Write the mutation
		* - Make a call to graphQLFetch with two parameters: mutation query, {variable}
		* - Post process data and take some action (e.g., re-load UI)  */
		const query = `mutation addTraveller($ticket: InputTicket!) {
			addTraveller(ticket: $ticket) {
				_id
			}
		}`;

		const res = await graphQLFetch(query, {ticket});
		if (res) {
			this.loadData();
		}

		/*End of Q3*/
	}

	async deleteTraveller(passenger) {
		/*Q3: Write code for GraphQL API call to delete a traveller
		* - Write the mutation
		* - Make a call to graphQLFetch with two parameters: mutation query, {variable}
		* - Post process data and take some action (e.g., re-load UI)  */
		const travellername = passenger.name;
		const query = `mutation deleteTraveller($travellername: String!) {
			deleteTraveller(travellername: $travellername)
		}`;

		const res = await graphQLFetch(query, {travellername});
		if (res) {
			this.loadData();
		}

		/*End of Q3*/
	}
	async blacklistTraveller(passenger) {
		/*Q4: Code to blacklist traveller at the back-end
		* - Write a mutation to blacklist traveller by providing the name.
		* - Make a call to graphQLFetch to execute the query.
		* - graphQLFetch accepts two parameters: query and {variable}  
		* - This GraphQL API call does not return anything. */
		const ticket = {
			name: passenger.name,
			phone: passenger.phone,
		}
		const query = `mutation blacklistTraveller($ticket: InputBlacklist!) {
			blacklistTraveller(ticket: $ticket) {
				_id
			}
		}`;
		const res = await graphQLFetch(query, {ticket});
		if (res) {
			this.loadBlacklistData();
		}

		/*End of Q4*/
	}

	render() {
		return (
			<div>
				<h1>Online Ticket Reservation Portal</h1>
			<div>
				<button onClick={()=>this.setSelector(1)}>Homepage</button>
				<button onClick={()=>this.setSelector(2)}>Display Travellers</button>
				<button onClick={()=>this.setSelector(3)}>Add Traveller</button>
				<button onClick={()=>this.setSelector(4)}>Delete Traveller</button>
				<button onClick={()=>this.setSelector(5)}>Blacklist Traveller</button>
			</div>
				{
					this.state.selector === 1? <Homepage />:<hr/>
				}
				{
					this.state.selector === 2? <Display travellers={this.state.travellers} />:<hr/>
				}
				{
					this.state.selector === 3? <Add bookTraveller={this.bookTraveller} />: <hr/>
				}
				{
					this.state.selector === 4? <Delete deleteTraveller={this.deleteTraveller} />: <hr/>
				}
				{
					this.state.selector === 5? <Blacklist blacklistTraveller={this.blacklistTraveller} />: <hr/>
				}
			</div>
		);
	}
}

const element = <TicketToRide />;

ReactDOM.render(element, document.getElementById('contents'));
