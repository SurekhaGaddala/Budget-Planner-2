import { useMemo, useState } from "react";
import { Wallet, LayoutDashboard, ArrowLeftRight, PieChart, Target, Settings, LogOut, Plus, Trash2, TrendingUp, TrendingDown, Bell, Search, Menu, X, Sparkles, CircleDollarSign } from "lucide-react";
import { PieChart as RePie, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import {
  useRegisterMutation, useLoginMutation, useGetTransactionsQuery, useAddTransactionMutation,
  useDeleteTransactionMutation, useGetBudgetsQuery, useSaveBudgetMutation, useDeleteBudgetMutation,
  useGetGoalsQuery, useAddGoalMutation, useUpdateGoalMutation, useDeleteGoalMutation,
  useGetProfileQuery, useUpdateProfileMutation
} from "./app/api";

const money = (n, currency="INR") => new Intl.NumberFormat("en-IN", { style:"currency", currency, maximumFractionDigits:0 }).format(Number(n)||0);
const monthNow = () => new Date().toISOString().slice(0,7);
const categories = ["Food","Transport","Shopping","Bills","Education","Health","Entertainment","Salary","Freelance","Other"];
const colors = ["#7568ed","#20b99a","#f6ad55","#ee7896","#4f9de8","#a78bfa","#e6c84f","#55b7c5"];
const errorText = (e) => e?.data?.message || "Something went wrong. Please try again.";

function AuthScreen() {
  const [mode,setMode] = useState("login");
  const [form,setForm] = useState({name:"",email:"",password:""});
  const [login, loginState] = useLoginMutation();
  const [register, registerState] = useRegisterMutation();
  const [error,setError] = useState("");
  const busy = loginState.isLoading || registerState.isLoading;
  async function submit(e) {
    e.preventDefault(); setError("");
    try {
      const result = mode === "login" ? await login({email:form.email,password:form.password}).unwrap() : await register(form).unwrap();
      localStorage.setItem("bp_token",result.token);
      localStorage.setItem("bp_user",JSON.stringify(result.user));
      window.location.reload();
    } catch(e) { setError(errorText(e)); }
  }
  return <main className="auth-shell">
    <section className="auth-visual"><div className="brand light"><span className="brand-icon"><Wallet size={22}/></span> budget<span>planner</span></div>
      <div className="visual-copy"><span className="eyebrow">YOUR MONEY, IN BALANCE</span><h1>Make your money<br/>work <em>for you.</em></h1><p>One calm place to plan, track and grow your finances.</p>
      <div className="mini-card"><div className="mini-top"><span>Monthly savings</span><TrendingUp size={17}/></div><strong>₹ 12,450</strong><small>You're building a good habit ✨</small><div className="mini-bars"><i/><i/><i/><i/><i/><i/><i/></div></div></div>
      <span className="visual-footer">A clearer picture of your finances starts here.</span>
    </section>
    <section className="auth-form-wrap"><form className="auth-form" onSubmit={submit}><div className="mobile-brand brand"><span className="brand-icon"><Wallet size={20}/></span> budget<span>planner</span></div>
      <span className="eyebrow">{mode==="login"?"WELCOME BACK":"GET STARTED"}</span><h2>{mode==="login"?"Sign in to your account":"Create your account"}</h2><p className="muted">Manage today. Plan for tomorrow.</p>
      {mode==="register" && <label>Full name<input required value={form.name} onChange={e=>setForm({...form,name:e.target.value})} placeholder="Your name"/></label>}
      <label>Email address<input required type="email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} placeholder="you@example.com"/></label>
      <label>Password<input required minLength="6" type="password" value={form.password} onChange={e=>setForm({...form,password:e.target.value})} placeholder="At least 6 characters"/></label>
      {error && <p className="error">{error}</p>}
      <button className="primary full" disabled={busy}>{busy?"Please wait...":mode==="login"?"Sign in":"Create account"}</button>
      <p className="switch-auth">{mode==="login"?"New to Budget Planner?":"Already have an account?"} <button type="button" onClick={()=>{setMode(mode==="login"?"register":"login");setError("");}}>{mode==="login"?"Create an account":"Sign in"}</button></p>
      <p className="auth-note">Your financial data is private to your account.</p>
    </form></section>
  </main>;
}

function App() {
  const [token,setToken] = useState(localStorage.getItem("bp_token"));
  const [active,setActive] = useState("Overview");
  const [mobileOpen,setMobileOpen] = useState(false);
  const [notice,setNotice] = useState("");
  const [transactionModal,setTransactionModal] = useState(false);
  const [budgetModal,setBudgetModal] = useState(false);
  const [goalModal,setGoalModal] = useState(false);
  const [txForm,setTxForm] = useState({type:"expense",title:"",category:"Food",amount:"",date:new Date().toISOString().slice(0,10),note:""});
  const [budgetForm,setBudgetForm] = useState({month:monthNow(),category:"Food",limit:""});
  const [goalForm,setGoalForm] = useState({title:"",target:"",saved:"0",deadline:""});
  const [currencyFrom,setCurrencyFrom] = useState("INR");
  const [currencyTo,setCurrencyTo] = useState("USD");
  const [convertAmount,setConvertAmount] = useState("1000");
  const [converted,setConverted] = useState(null);
  const [convertError,setConvertError] = useState("");
  const [convertBusy,setConvertBusy] = useState(false);
  if (!token) return <AuthScreen/>;
  return <Dashboard
    active={active} setActive={setActive} mobileOpen={mobileOpen} setMobileOpen={setMobileOpen}
    notice={notice} setNotice={setNotice} transactionModal={transactionModal} setTransactionModal={setTransactionModal}
    budgetModal={budgetModal} setBudgetModal={setBudgetModal} goalModal={goalModal} setGoalModal={setGoalModal}
    txForm={txForm} setTxForm={setTxForm} budgetForm={budgetForm} setBudgetForm={setBudgetForm}
    goalForm={goalForm} setGoalForm={setGoalForm} currencyFrom={currencyFrom} setCurrencyFrom={setCurrencyFrom}
    currencyTo={currencyTo} setCurrencyTo={setCurrencyTo} convertAmount={convertAmount} setConvertAmount={setConvertAmount}
    converted={converted} setConverted={setConverted} convertError={convertError} setConvertError={setConvertError}
    convertBusy={convertBusy} setConvertBusy={setConvertBusy}
    logout={()=>{localStorage.removeItem("bp_token");localStorage.removeItem("bp_user");setToken(null);}}
  />;
}

function Dashboard(p) {
  const {data:transactions=[],isLoading:txLoading}=useGetTransactionsQuery();
  const {data:budgets=[]}=useGetBudgetsQuery();
  const {data:goals=[]}=useGetGoalsQuery();
  const {data:profile}=useGetProfileQuery();
  const [addTransaction]=useAddTransactionMutation();
  const [deleteTransaction]=useDeleteTransactionMutation();
  const [saveBudget]=useSaveBudgetMutation();
  const [deleteBudget]=useDeleteBudgetMutation();
  const [addGoal]=useAddGoalMutation();
  const [updateGoal]=useUpdateGoalMutation();
  const [deleteGoal]=useDeleteGoalMutation();
  const [updateProfile]=useUpdateProfileMutation();
  const [profileForm,setProfileForm]=useState(null);
  const [filter,setFilter]=useState("all");
  const [search,setSearch]=useState("");
  const currentMonth=monthNow();
  const thisMonth=transactions.filter(t=>(t.date||"").slice(0,7)===currentMonth);
  const income=thisMonth.filter(t=>t.type==="income").reduce((s,t)=>s+Number(t.amount),0);
  const expense=thisMonth.filter(t=>t.type==="expense").reduce((s,t)=>s+Number(t.amount),0);
  const savings=income-expense;
  const monthBudgets=budgets.filter(b=>b.month===currentMonth);
  const spentByCategory=useMemo(()=>thisMonth.filter(t=>t.type==="expense").reduce((a,t)=>{a[t.category]=(a[t.category]||0)+Number(t.amount);return a;},{}),[thisMonth]);
  const chartData=Object.entries(spentByCategory).map(([name,value])=>({name,value}));
  const nav=[["Overview",LayoutDashboard],["Transactions",ArrowLeftRight],["Budgets",PieChart],["Savings goals",Target],["Insights",Sparkles],["Profile",Settings]];
  const show=(msg)=>{p.setNotice(msg);setTimeout(()=>p.setNotice(""),3200);};
  async function submitTx(e){e.preventDefault();try{await addTransaction({...p.txForm,amount:Number(p.txForm.amount)}).unwrap();p.setTransactionModal(false);p.setTxForm({type:"expense",title:"",category:"Food",amount:"",date:new Date().toISOString().slice(0,10),note:""});show("Transaction added successfully");}catch(e){show(errorText(e));}}
  async function submitBudget(e){e.preventDefault();try{await saveBudget({...p.budgetForm,limit:Number(p.budgetForm.limit)}).unwrap();p.setBudgetModal(false);show("Budget saved");}catch(e){show(errorText(e));}}
  async function submitGoal(e){e.preventDefault();try{await addGoal({...p.goalForm,target:Number(p.goalForm.target),saved:Number(p.goalForm.saved)}).unwrap();p.setGoalModal(false);p.setGoalForm({title:"",target:"",saved:"0",deadline:""});show("Savings goal created");}catch(e){show(errorText(e));}}
  async function convert(){p.setConvertBusy(true);p.setConvertError("");p.setConverted(null);try{const r=await fetch(`https://api.frankfurter.dev/v1/latest?base=${p.currencyFrom}&symbols=${p.currencyTo}`);if(!r.ok)throw new Error("Currency conversion is unavailable right now");const d=await r.json();p.setConverted(Number(p.convertAmount)*d.rates[p.currencyTo]);}catch(e){p.setConvertError(e.message);}finally{p.setConvertBusy(false);}}
  const recent=transactions.filter(t=>(filter==="all"||t.type===filter)&&(`${t.title} ${t.category}`).toLowerCase().includes(search.toLowerCase()));
  const overspent=monthBudgets.filter(b=>(spentByCategory[b.category]||0)>b.limit);
  const fmt=(n)=>money(n,profile?.currency||"INR");
  return <div className="app-shell">
    <aside className={`sidebar ${p.mobileOpen?"open":""}`}><div className="brand"><span className="brand-icon"><Wallet size={21}/></span> budget<span>planner</span><button className="mobile-close" onClick={()=>p.setMobileOpen(false)}><X/></button></div>
      <div className="side-label">WORKSPACE</div><nav>{nav.map(([name,Icon])=><button key={name} className={`nav-item ${p.active===name?"selected":""}`} onClick={()=>{p.setActive(name);p.setMobileOpen(false);}}><Icon size={18}/>{name}{name==="Insights"&&<span className="new-dot"/>}</button>)}</nav>
      <div className="sidebar-bottom"><div className="help-card"><div className="help-icon"><Sparkles size={18}/></div><strong>Small steps add up.</strong><p>Keep an eye on your spending and celebrate your progress.</p></div><button className="nav-item logout" onClick={p.logout}><LogOut size={18}/> Log out</button></div>
    </aside>
    <main className="main-area"><header className="topbar"><button className="menu-btn" onClick={()=>p.setMobileOpen(true)}><Menu/></button><div className="breadcrumb">Workspace <span>/</span> <b>{p.active}</b></div><div className="top-actions"><span className="date-label">{new Date().toLocaleDateString("en-IN",{day:"numeric",month:"short",year:"numeric"})}</span><span className="avatar">{(profile?.name||"U").slice(0,1).toUpperCase()}</span><div className="user-label"><b>{profile?.name||"Your account"}</b><small>Personal account</small></div></div></header>
      <section className="page-content">
        {p.notice&&<div className="toast">{p.notice}</div>}
        {p.active==="Overview"&&<><div className="page-heading"><div><span className="eyebrow">YOUR FINANCIAL SNAPSHOT</span><h1>Good {new Date().getHours()<12?"morning":new Date().getHours()<17?"afternoon":"evening"}, {profile?.name?.split(" ")[0]||"there"} <span>✦</span></h1><p>Here's what's happening with your money this month.</p></div><button className="primary" onClick={()=>p.setTransactionModal(true)}><Plus size={17}/> Add transaction</button></div>
          <div className="stats-grid"><Stat icon={TrendingUp} label="Total income" value={fmt(income)} note="This month" tone="green"/><Stat icon={TrendingDown} label="Total expenses" value={fmt(expense)} note="This month" tone="rose"/><Stat icon={Wallet} label="Available savings" value={fmt(savings)} note="Income minus expenses" tone="purple"/><Stat icon={PieChart} label="Budget allocated" value={fmt(monthBudgets.reduce((s,b)=>s+b.limit,0))} note={`${monthBudgets.length} categories`} tone="amber"/></div>
          {overspent.length>0&&<div className="alert"><Bell size={18}/><div><b>Budget alert</b><span>You've exceeded the budget for {overspent.map(b=>b.category).join(", ")}. Review your spending.</span></div></div>}
          <div className="content-grid"><section className="panel spending-panel"><div className="panel-head"><div><h3>Expense breakdown</h3><p>Where your money went this month</p></div><span className="period-pill">This month</span></div>{chartData.length?<><div className="chart-wrap"><ResponsiveContainer width="100%" height={220}><RePie><Pie data={chartData} dataKey="value" nameKey="name" innerRadius={63} outerRadius={90} paddingAngle={3}>{chartData.map((d,i)=><Cell key={d.name} fill={colors[i%colors.length]}/>)}</Pie><Tooltip formatter={(v)=>fmt(v)}/></RePie></ResponsiveContainer><div className="chart-center"><b>{fmt(expense)}</b><small>Total spent</small></div></div><div className="legend">{chartData.map((d,i)=><div key={d.name}><i style={{background:colors[i%colors.length]}}/>{d.name}<b>{fmt(d.value)}</b></div>)}</div></>:<Empty text="Add expense transactions to see your spending breakdown."/>}</section>
            <section className="panel budget-panel"><div className="panel-head"><div><h3>Monthly budgets</h3><p>Track your category limits</p></div><button className="text-button" onClick={()=>p.setActive("Budgets")}>View all</button></div>{monthBudgets.length?monthBudgets.slice(0,5).map(b=><BudgetLine key={b._id} budget={b} spent={spentByCategory[b.category]||0} currency={profile?.currency||"INR"}/>):<Empty text="Create your first monthly budget to stay on track."/>}<button className="outline full add-budget" onClick={()=>p.setBudgetModal(true)}><Plus size={16}/> Create a budget</button></section></div>
          <section className="panel transactions-panel"><div className="panel-head"><div><h3>Recent transactions</h3><p>Your latest income and expenses</p></div><button className="text-button" onClick={()=>p.setActive("Transactions")}>See all</button></div><TransactionTable items={transactions.slice(0,5)} fmt={fmt} onDelete={id=>deleteTransaction(id)}/></section>
        </>}
        {p.active==="Transactions"&&<><div className="page-heading"><div><span className="eyebrow">MONEY MOVEMENT</span><h1>Transactions</h1><p>Every income and expense, all in one place.</p></div><button className="primary" onClick={()=>p.setTransactionModal(true)}><Plus size={17}/> Add transaction</button></div><section className="panel"><div className="toolbar"><div className="search-box"><Search size={17}/><input placeholder="Search transactions..." value={search} onChange={e=>setSearch(e.target.value)}/></div><select value={filter} onChange={e=>setFilter(e.target.value)}><option value="all">All transactions</option><option value="income">Income</option><option value="expense">Expenses</option></select></div><TransactionTable items={recent} fmt={fmt} onDelete={id=>deleteTransaction(id)}/></section></>}
        {p.active==="Budgets"&&<><div className="page-heading"><div><span className="eyebrow">PLAN WITH PURPOSE</span><h1>Monthly budgets</h1><p>Set limits for the categories that matter.</p></div><button className="primary" onClick={()=>p.setBudgetModal(true)}><Plus size={17}/> Create budget</button></div><div className="budget-grid">{budgets.map(b=><div className="panel budget-card" key={b._id}><div className="budget-card-top"><span className="category-icon">{b.category.slice(0,1)}</span><button className="icon-btn danger" onClick={()=>deleteBudget(b._id)}><Trash2 size={16}/></button></div><small>{b.month}</small><h3>{b.category}</h3><BudgetLine budget={b} spent={transactions.filter(t=>t.type==="expense"&&(t.date||"").slice(0,7)===b.month&&t.category===b.category).reduce((s,t)=>s+Number(t.amount),0)} currency={profile?.currency||"INR"}/></div>)}</div>{!budgets.length&&<section className="panel"><Empty text="No budgets yet. Create one to start planning."/></section>}</>}
        {p.active==="Savings goals"&&<><div className="page-heading"><div><span className="eyebrow">FUTURE YOU WILL THANK YOU</span><h1>Savings goals</h1><p>Give your savings a purpose and watch them grow.</p></div><button className="primary" onClick={()=>p.setGoalModal(true)}><Plus size={17}/> Add a goal</button></div><div className="goal-grid">{goals.map(g=><div className="panel goal-card" key={g._id}><div className="goal-icon"><Target/></div><button className="icon-btn danger goal-delete" onClick={()=>deleteGoal(g._id)}><Trash2 size={16}/></button><h3>{g.title}</h3><p>{g.deadline?`Target date: ${new Date(g.deadline).toLocaleDateString("en-IN")}`:"Keep going, one step at a time."}</p><div className="goal-amount"><b>{fmt(g.saved)}</b><span>of {fmt(g.target)}</span></div><div className="progress-track"><i style={{width:`${Math.min(100,g.saved/g.target*100)}%`}}/></div><div className="goal-footer"><span>{Math.min(100,Math.round(g.saved/g.target*100))}% completed</span><button className="text-button" onClick={()=>{const v=prompt("Enter your total saved amount",g.saved);if(v!==null&&!Number.isNaN(Number(v))&&Number(v)>=0)updateGoal({id:g._id,saved:Number(v)});}}>Update savings</button></div></div>)}</div>{!goals.length&&<section className="panel"><Empty text="Create a savings goal for something important to you."/></section>}</>}
        {p.active==="Insights"&&<><div className="page-heading"><div><span className="eyebrow">KNOW YOUR PATTERNS</span><h1>Financial insights</h1><p>Simple signals to help you make informed choices.</p></div></div><div className="insight-grid"><div className="panel insight-card"><span className="insight-icon green-bg"><TrendingUp/></span><small>MONTHLY SAVINGS RATE</small><h2>{income>0?Math.round(savings/income*100):0}%</h2><p>Share of this month's income remaining after expenses.</p></div><div className="panel insight-card"><span className="insight-icon purple-bg"><CircleDollarSign/></span><small>AVERAGE EXPENSE</small><h2>{fmt(thisMonth.filter(t=>t.type==="expense").length?expense/thisMonth.filter(t=>t.type==="expense").length:0)}</h2><p>Average value per expense transaction this month.</p></div><div className="panel insight-card"><span className="insight-icon amber-bg"><Bell/></span><small>BUDGET STATUS</small><h2>{overspent.length?"Needs attention":"On track"}</h2><p>{overspent.length?`${overspent.length} category budget(s) exceeded.`:"No category budget has been exceeded this month."}</p></div></div><section className="panel converter"><div><span className="eyebrow">THIRD-PARTY API</span><h3>Currency converter</h3><p>Check indicative exchange rates with Frankfurter.</p></div><div className="converter-controls"><input type="number" min="0" value={p.convertAmount} onChange={e=>p.setConvertAmount(e.target.value)}/><select value={p.currencyFrom} onChange={e=>p.setCurrencyFrom(e.target.value)}>{["INR","USD","EUR","GBP","JPY","AUD","CAD"].map(c=><option key={c}>{c}</option>)}</select><span>to</span><select value={p.currencyTo} onChange={e=>p.setCurrencyTo(e.target.value)}>{["USD","INR","EUR","GBP","JPY","AUD","CAD"].map(c=><option key={c}>{c}</option>)}</select><button className="primary" onClick={convert} disabled={p.convertBusy||!p.convertAmount}>{p.convertBusy?"Loading...":"Convert"}</button></div>{p.converted!==null&&<div className="conversion-result">{Number(p.convertAmount).toLocaleString()} {p.currencyFrom} = <b>{p.converted.toLocaleString(undefined,{maximumFractionDigits:2})} {p.currencyTo}</b></div>}{p.convertError&&<p className="error">{p.convertError}</p>}<small className="muted">Rates are indicative and may be delayed. Not financial advice.</small></section><section className="panel"><div className="panel-head"><div><h3>Spending by category</h3><p>Current month expense distribution</p></div></div>{chartData.length?<div className="legend wide">{chartData.map((d,i)=><div key={d.name}><i style={{background:colors[i%colors.length]}}/>{d.name}<b>{fmt(d.value)}</b></div>)}</div>:<Empty text="Add expenses to generate category insights."/>}</section></>}
        {p.active==="Profile"&&<><div className="page-heading"><div><span className="eyebrow">YOUR DETAILS</span><h1>Financial profile</h1><p>Keep your personal finance preferences up to date.</p></div></div><section className="panel profile-panel"><div className="profile-avatar">{(profile?.name||"U").slice(0,1).toUpperCase()}</div><div><h3>{profile?.name}</h3><p className="muted">{profile?.email}</p></div><hr/><form onSubmit={async e=>{e.preventDefault();try{await updateProfile(profileForm||{name:profile.name,currency:profile.currency,monthlyIncome:profile.monthlyIncome}).unwrap();show("Profile updated");}catch(e){show(errorText(e));}}} className="profile-form"><label>Full name<input value={(profileForm||profile||{}).name||""} onChange={e=>setProfileForm({...profile,...profileForm,name:e.target.value})}/></label><label>Email address<input value={profile?.email||""} disabled/></label><label>Preferred currency<select value={(profileForm||profile||{}).currency||"INR"} onChange={e=>setProfileForm({...profile,...profileForm,currency:e.target.value})}>{["INR","USD","EUR","GBP","JPY","AUD","CAD"].map(c=><option key={c}>{c}</option>)}</select></label><label>Expected monthly income<input type="number" min="0" value={(profileForm||profile||{}).monthlyIncome??0} onChange={e=>setProfileForm({...profile,...profileForm,monthlyIncome:e.target.value})}/></label><button className="primary">Save changes</button></form></section></>}
      </section>
    </main>
    {p.mobileOpen&&<button className="sidebar-scrim" onClick={()=>p.setMobileOpen(false)} aria-label="Close menu"/>}
    {p.transactionModal&&<Modal title="Add transaction" close={()=>p.setTransactionModal(false)}><form onSubmit={submitTx} className="modal-form"><div className="segmented"><button type="button" className={p.txForm.type==="expense"?"active":""} onClick={()=>p.setTxForm({...p.txForm,type:"expense",category:"Food"})}>Expense</button><button type="button" className={p.txForm.type==="income"?"active":""} onClick={()=>p.setTxForm({...p.txForm,type:"income",category:"Salary"})}>Income</button></div><label>Description<input required value={p.txForm.title} onChange={e=>p.setTxForm({...p.txForm,title:e.target.value})} placeholder="e.g. Grocery shopping"/></label><div className="form-row"><label>Amount<input required type="number" min="0.01" step="0.01" value={p.txForm.amount} onChange={e=>p.setTxForm({...p.txForm,amount:e.target.value})}/></label><label>Category<select value={p.txForm.category} onChange={e=>p.setTxForm({...p.txForm,category:e.target.value})}>{categories.filter(c=>p.txForm.type==="income"?["Salary","Freelance","Other"].includes(c):!["Salary","Freelance"].includes(c)).map(c=><option key={c}>{c}</option>)}</select></label></div><label>Date<input type="date" required value={p.txForm.date} onChange={e=>p.setTxForm({...p.txForm,date:e.target.value})}/></label><label>Note (optional)<input value={p.txForm.note} onChange={e=>p.setTxForm({...p.txForm,note:e.target.value})} placeholder="Add a note"/></label><button className="primary full">Save transaction</button></form></Modal>}
    {p.budgetModal&&<Modal title="Create monthly budget" close={()=>p.setBudgetModal(false)}><form onSubmit={submitBudget} className="modal-form"><label>Month<input type="month" required value={p.budgetForm.month} onChange={e=>p.setBudgetForm({...p.budgetForm,month:e.target.value})}/></label><label>Category<select value={p.budgetForm.category} onChange={e=>p.setBudgetForm({...p.budgetForm,category:e.target.value})}>{categories.filter(c=>!["Salary","Freelance"].includes(c)).map(c=><option key={c}>{c}</option>)}</select></label><label>Budget limit<input required type="number" min="1" value={p.budgetForm.limit} onChange={e=>p.setBudgetForm({...p.budgetForm,limit:e.target.value})} placeholder="e.g. 5000"/></label><button className="primary full">Save budget</button></form></Modal>}
    {p.goalModal&&<Modal title="Create savings goal" close={()=>p.setGoalModal(false)}><form onSubmit={submitGoal} className="modal-form"><label>Goal name<input required value={p.goalForm.title} onChange={e=>p.setGoalForm({...p.goalForm,title:e.target.value})} placeholder="e.g. New laptop"/></label><div className="form-row"><label>Target amount<input required type="number" min="1" value={p.goalForm.target} onChange={e=>p.setGoalForm({...p.goalForm,target:e.target.value})}/></label><label>Already saved<input type="number" min="0" value={p.goalForm.saved} onChange={e=>p.setGoalForm({...p.goalForm,saved:e.target.value})}/></label></div><label>Target date (optional)<input type="date" value={p.goalForm.deadline} onChange={e=>p.setGoalForm({...p.goalForm,deadline:e.target.value})}/></label><button className="primary full">Create goal</button></form></Modal>}
  </div>;
}
function Stat({icon:Icon,label,value,note,tone}){return <div className="stat-card"><div className={`stat-icon ${tone}`}><Icon size={19}/></div><span>{label}</span><strong>{value}</strong><small>{note}</small></div>}
function Empty({text}){return <div className="empty-state"><span><Sparkles size={20}/></span><p>{text}</p></div>}
function BudgetLine({budget,spent,currency}){const pct=budget.limit?spent/budget.limit*100:0;return <div className="budget-line"><div className="budget-numbers"><span>{money(spent,currency)} <small>spent</small></span><b>{money(budget.limit,currency)}</b></div><div className="progress-track"><i className={pct>100?"over":""} style={{width:`${Math.min(100,pct)}%`}}/></div><small className={pct>100?"over-text":"remaining-text"}>{pct>100?`${money(spent-budget.limit,currency)} over budget`:`${money(budget.limit-spent,currency)} remaining`}</small></div>}
function TransactionTable({items,fmt,onDelete}){return <div className="table-wrap"><table><thead><tr><th>TRANSACTION</th><th>CATEGORY</th><th>DATE</th><th>AMOUNT</th><th></th></tr></thead><tbody>{items.map(t=><tr key={t._id}><td><div className="transaction-name"><span className={t.type==="income"?"income-mark":"expense-mark"}>{t.type==="income"?<TrendingUp size={16}/>:<TrendingDown size={16}/>}</span><div><b>{t.title}</b><small>{t.note||t.type}</small></div></div></td><td><span className="category-pill">{t.category}</span></td><td>{new Date(t.date).toLocaleDateString("en-IN",{day:"2-digit",month:"short",year:"numeric"})}</td><td className={t.type==="income"?"amount-in":"amount-out"}>{t.type==="income"?"+":"−"}{fmt(t.amount)}</td><td><button className="icon-btn danger" onClick={()=>onDelete(t._id)} aria-label="Delete transaction"><Trash2 size={15}/></button></td></tr>)}</tbody></table>{!items.length&&<Empty text="No transactions found. Add your first transaction to get started."/>}</div>}
function Modal({title,close,children}){return <div className="modal-backdrop" onMouseDown={e=>{if(e.target===e.currentTarget)close();}}><section className="modal"><div className="modal-head"><h3>{title}</h3><button className="icon-btn" onClick={close}><X/></button></div>{children}</section></div>}
export default App;
