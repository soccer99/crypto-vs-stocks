<template>
	<div class="container">
		<div class="columns" v-if="getCurrentBitcoinPrice">
			<!-- <line-chart :chart-data="datacollection" :options="options" :width="900"></line-chart> -->
			<div class="column is-3">
				<button class="button is-danger" @click="resetAll">Reset</button>
			</div>
			<div class="column has-text-right">Current Bitcoin Price: ${{ getCurrentBitcoinPrice }}</div>
		</div>

		<div class="columns has-text-centered">
			<div class="column">
				<div class="card">
					<div class="card-header">
						<p class="card-header-title">
							Bitcoin
						</p>
					</div>
					<div class="card-content">
						<div class="content">
							{{ total_bitcoin }}
						</div>
					</div>
				</div>
			</div>
			<div class="column">
				<div class="card">
					<div class="card-header">
						<p class="card-header-title">
							Cash
						</p>
					</div>
					<div class="card-content">
						<div class="content">
							${{ numberWithCommas(total_cash) }}
						</div>
					</div>
				</div>
			</div>
			<div class="column">
				<div class="card">
					<div class="card-header">
						<p class="card-header-title">
							Invested
						</p>
					</div>
					<div class="card-content">
						<div class="content">
							${{ numberWithCommas(total_spent) }}
						</div>
					</div>
				</div>
			</div>
			<div class="column">
				<div class="card">
					<div class="card-header">
						<p class="card-header-title">
							Profit
						</p>
					</div>
					<div class="card-content">
						<div :class="{ red: total_profit < 0, green: total_profit > 0, content: true}">
							${{ numberWithCommas(total_profit) }}
						</div>
					</div>
				</div>
			</div>
		</div>

		<div class="columns">
			<div class="column">
				<peity :type="'line'" :options="{ stroke: 'red', width: 505, height:250 }" :data="getBitcoinValues"></peity>
			</div>
			<div class="column">
				
			</div>
			<div class="column">
				
			</div>
		</div>

		<div class="columns has-text-centered">
			<div class="column is-6 is-offset-one-quarter">
	    		<button class="button is-large is-primary" type="button" @click="adding_transaction = !adding_transaction">New Transaction</button>
	    	</div>
	    </div>
	    <div class="columns">
			<div class="column is-6 is-offset-one-quarter">
				<div v-if="adding_transaction">
					<div class="field">
						<label class="label" for="date">Date</label>
						<datepicker @input="changeUSD" v-model="date_start" width="100%" placeholder="Set Transaction Date" :config="{ dateFormat: 'Y-m-d' }"></datepicker>
					</div>
					<div class="field">
						<label class="label" for="bitcoin">Bitcoin</label>
						<input class="input" name="bitcoin" type="number" v-model="bitcoin" :disabled="recurring != 'one'" @change="changeBTC">
					</div>
					<div class="field">
						<label class="label" for="cash">USD</label>
						<input class="input" name="cash" type="number" v-model="usd" @change="changeUSD">
					</div>
					<div class="field">
						<p class="control">
							<label class="radio">
								<input type="radio" name="recurring" value="one" v-model="recurring">
								One Time
							</label>
							<label class="radio">
								<input type="radio" name="recurring" value="recurring" v-model="recurring">
								Recurring
							</label>
						</p>
					</div>
					<template v-if="recurring=='recurring'">
						<div class="field">
							<label class="label">Ends</label>
							<datepicker v-model="date_end"></datepicker>
						</div>
						<div class="field">
							<label class="label">Frequency</label>
							<p class="control">
								<label class="radio">
									<input type="radio" name="frequency" value="days" v-model="frequency">
									Daily
								</label>
								<label class="radio">
									<input type="radio" name="frequency" value="weeks" v-model="frequency">
									Weekly
								</label>
								<label class="radio">
									<input type="radio" name="frequency" value="months" v-model="frequency">
									Monthly
								</label>
							</p>
						</div>
						<div class="field">
							<p>
								{{ getNumTransactions }} transactions
							</p>
						</div>
					</template>
					<div class="field">
						<button @click="newTransaction" class="button is-primary" type="button">Add Transaction</button>
					</div>
				</div>
			</div>
		</div>
	    
	    <div class="columns">
	    	<table class="table is-striped" v-if="getTransactions.length > 0">
	    		<thead>
	    			<th>Date</th>
	    			<th>Coins</th>
	    			<th>USD</th>
	    			<th>Type</th>
	    			<th>Frequency</th>
	    			<th>Date Ended</th>
	    			<th>Duration</th>
	    		</thead>
	    		<tbody>
					<tr v-for="t in getTransactions">
						<td>{{t.date_start}}</td>
						<td>{{t.coins}}</td>
						<td>{{t.usd}}</td>
						<td>{{t.type}}</td>
						<td>{{FrequencyTerms[t.frequency]}}</td>
						<td>{{t.date_end}}</td>
						<td>{{getNumTransactionsTable(t.date_start, t.date_end, t.frequency)}}</td>
					</tr>
	    		</tbody>
	    	</table>
	    </div>
	</div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import LineChart from 'components/Chart'

// import 'bulma'
import Moment from 'moment'

import Datepicker from 'vue-bulma-datepicker'

import Peity from 'vue-peity'

export default {
	data() {
		return {
			adding_transaction: false,
			bitcoin: 0,
			usd: 0,
			date_start: '',
			date_end: '',
			recurring: 'one',
			frequency: 'days',
			datacollection: null,
			startTime: {
				time: ''
			},
			FrequencyTerms: {
				'days': "Daily",
				'weeks': "Weekly",
				'months': "Monthly"
			},
			limit: [{
				type: 'fromto',
				from:'2010-07-17',
				to: Moment()
			},],
			option: {
				type: 'day',
				week: ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'],
				month: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
				format: 'YYYY-MM-DD',
				placeholder: 'when?',
				inputStyle: {
					'display': 'inline-block',
					'padding': '6px',
					'line-height': '22px',
					'font-size': '16px',
					'border': '2px solid #fff',
					'box-shadow': '0 1px 3px 0 rgba(0, 0, 0, 0.2)',
					'border-radius': '2px',
					'color': '#5F5F5F'
				}
			},
		}
	},
	methods: {
		resetAll() {
			this.resetTransaction();
			this.$store.dispatch('ResetAll');
		},
		getNumTransactionsTable(date_start, date_end, frequency) {
			if (date_start && date_end) {
				let d = Moment(date_start);
				let d_end = Moment(date_end);
				let duration = d_end.diff(d, frequency);
				return duration
			}
			return "One"
		},
		numberWithCommas(x) {
			return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
		},
		changeUSD() {
			if (this.date_start) {
				let value = this.usd / this.$store.state.bitcoin[this.date_start].value;
				this.bitcoin = value
			}
		},
		changeBTC() {
			if (this.date_start) {
				let value = this.bitcoin * this.$store.state.bitcoin[this.date_start].value;
				this.usd = value.toFixed(2)
			}
		},
		newTransaction() {
			let transaction = {
				type: this.recurring,
				frequency: this.frequency,
				coins: parseFloat(this.bitcoin),
				usd: parseFloat(this.usd),
				date_start: this.date_start,
				date_end: this.date_end,
			}
			if (this.date_start && this.usd > 0) {
				this.$store.dispatch('addBitcoinTransaction', transaction)
				this.resetTransaction();
			}

		},
		resetTransaction() {
			this.adding_transaction = false;
			this.date_start = '';
			this.date_end = '';
			this.usd = 0;
			this.bitcoin = 0;
		},
		...mapActions([
			'addTransaction',
			'transactionSetStartDate',
			'transactionSetEndDate'
		])
		
	},
	computed: {
		getNumTransactions() {
			if (this.date_start && this.date_end) {
				let d = Moment(this.date_start);
				let d_end = Moment(this.date_end);
				let duration = d_end.diff(d, this.frequency);
				return duration
			}
			return "One"
		},
		getTransactions() {
			return this.$store.state.transactions
		},
		getBitcoinPriceFromStartDate() {
			if (this.$store.state.transaction_start_date) {
				return this.$store.state.bitcoin[this.$store.state.transaction_start_date].value
			}
			return ''
		},
		total_bitcoin() {
			return this.$store.state.total_bitcoin
		},
		...mapGetters([
			// 'getTransactions',
			'getCurrentBitcoinPrice',
			'getBitcoin',
			'getBitcoinValues',
			'getActiveDate',
			'getDataFromActiveDate',
			'total_bitcoin',
			'total_cash',
			'total_spent',
			'total_profit'
		])
	},
	components: {
		LineChart,
		Datepicker,
		Peity
	}
}
</script>

<style lang="scss">

	.red {
		color: red;
	}
	.green {
		color: green;
	}

	line-chart {
		width: 100%;
	}
	canvas {
		-moz-user-select: none;
		-webkit-user-select: none;
		-ms-user-select: none;
	}
</style>
