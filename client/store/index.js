import Vue from 'vue'
import Vuex from 'vuex'

import axios from 'axios'

import Moment from 'moment'

import * as types from '../types'

import BitcoinData from '../assets/bitcoin_history.json'

Vue.use(Vuex)

const state = {
	current_bitcoin_price: 0,
	count: 0,
	active_date: '2016-01-01',
	bitcoin: BitcoinData,
	total_bitcoin: 0,
	total_cash: 0,
	total_spent: 0,
	transactions: [],
}

const getters = {
	getCurrentBitcoinPrice: (state) => {
		return state.current_bitcoin_price
	},
	getTransactions: (state) => {
		return state.transactions
	},
	getBitcoin: (state) => {
		return state.bitcoin
	},
	getBitcoinValues: (state) => {
		let values = Object.keys(state.bitcoin).filter((val, index) => {
			return index % 27 == 0
		}).map((day) => state.bitcoin[day].value).toString();
		console.log(values);
		return values
	},
	getActiveDate: (state) => {
		return state.active_date
	},
	getDataFromActiveDate: (state) => {
		return state.bitcoin[state.active_date].value
	},
	total_bitcoin: (state) => {
		return state.total_bitcoin
	},
	total_cash: (state) => {
		let b = state.total_bitcoin
		let bp = state.current_bitcoin_price
		let total = b * bp;
		return total.toFixed(2)
	},
	total_spent: (state) => {
		return state.total_spent
	},
	total_profit: (state) => {
		let b = state.total_bitcoin
		let bp = state.current_bitcoin_price
		let sub_total = b * bp;
		let total = sub_total - state.total_spent
		return total.toFixed(2)
	}
}

const mutations = {
	[types.TRANSACTION_SET_START_DATE] (state, payload) {
		state.transaction_start_date = payload
	},
	[types.TRANSACTION_SET_END_DATE] (state, payload) {
		state.transaction_end_date = payload
	},
	[types.ADD_TRANSACTION] (state, payload) {
		state.transactions.push(payload)
	},
	[types.SET_CURRENT_BITCOIN_PRICE] (state, payload) {
		state.current_bitcoin_price = parseFloat(payload)
	},
	[types.BITCOIN_SET_COINS] (state, payload) {
		state.total_bitcoin = payload
	},
	[types.INVESTMENT_SET] (state, payload) {
		state.total_spent = payload
	},
	[types.RESET_ALL] (state) {
		state.total_bitcoin = 0;
		state.total_cash = 0;
		state.total_spent = 0;
		state.total_profit = 0;
		state.transactions = [];
	}
}

const actions = {
	ResetAll({commit}) {
		commit(types.RESET_ALL)
	},
	getCurrentBitcoinPrice({commit}) {
		console.log("GET BITCOIN PRICE")
		
		// Prevent sending too many requests to bitcoin api until in production
		commit(types.SET_CURRENT_BITCOIN_PRICE, 2423.8713);


		// axios.get('http://api.coindesk.com/v1/bpi/currentprice.json')
		// 	.then((response) => {
		// 		commit(types.SET_CURRENT_BITCOIN_PRICE, response.data.bpi.USD.rate)
		// 	})
		// 	.catch((error) => {
		// 		console.log(error)
		// 	})
	},
	addBitcoinTransaction({commit, state}, payload) {
		commit(types.ADD_TRANSACTION, payload)

		let coins = 0;
		let cash = 0;
		let investment = 0;

		state.transactions.map((i) => {
			if (i.type == 'one') {
				coins += i.coins;
				investment += i.usd;
			}
			else if (i.type == 'recurring') {
				if (i.date_end) {
					let d = Moment(i.date_start);
					let d_end = Moment(i.date_end);
					let duration = d_end.diff(d, i.frequency)
					console.log("Timespan between dates: ", duration)
					for (var t=0; t<duration; t++) {
						let ddd = Moment(d).add(t, i.frequency)
						let dddd = ddd.format("YYYY-MM-DD")
						console.log("Date:", dddd)
						let b_price_date = state.bitcoin[dddd]
						console.log("Bitcoin price on ", dddd, ":", b_price_date)
						coins += i.usd / b_price_date.value;
						investment += i.usd
					}
				}
					
			}
		});

		commit(types.BITCOIN_SET_COINS, coins)
		commit(types.INVESTMENT_SET, investment)
	}
}

const store = new Vuex.Store({
	state,
	getters,
	mutations,
	actions
})

export default store
