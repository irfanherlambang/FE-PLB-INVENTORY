import React, { useState } from 'react'

export default function Configuration() {
  const [email, setEmail] = useState('')
  const [contractStart, setContractStart] = useState('')
  const [contractEnd, setContractEnd] = useState('')
  const [ceisaUser, setCeisaUser] = useState('')
  const [ceisaPass, setCeisaPass] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    console.log({ email, contractStart, contractEnd, ceisaUser, ceisaPass })
    alert('Settings saved (console logged).')
  }

  const container = {
    display: 'flex',
    gap: 20,
    alignItems: 'flex-start',
    flexWrap: 'wrap',
  }
  const card = {
    flex: '1 1 300px',
    minWidth: 280,
    border: '1px solid #e1e6eb',
    borderRadius: 8,
    padding: 18,
    boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
    background: '#fff',
  }
  const label = { display: 'block', fontSize: 13, marginBottom: 6, color: '#374151' }
  const input = {
    width: '100%',
    padding: '8px 10px',
    borderRadius: 6,
    border: '1px solid #d1d5db',
    marginBottom: 12,
    boxSizing: 'border-box',
  }

  return (
    <div>
      <h2>Konfigurasi</h2>
      <form onSubmit={handleSubmit} style={container}>
        {/* Email Pemberitahuan */}
        <section style={card}>
          <h4>Pemberitahuan Email</h4>
          <label style={label} htmlFor="email">Email *</label>
          <input
            id="email"
            type="email"
            placeholder="email@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={input}
            required
          />
        </section>

        {/* Kontrak start - end */}
        <section style={card}>
          <h4>Kontrak</h4>
          <label style={label} htmlFor="contractStart">Start Date</label>
          <input
            id="contractStart"
            type="date"
            value={contractStart}
            onChange={(e) => setContractStart(e.target.value)}
            style={input}
            required
          />

          <label style={label} htmlFor="contractEnd">End Date</label>
          <input
            id="contractEnd"
            type="date"
            value={contractEnd}
            onChange={(e) => setContractEnd(e.target.value)}
            style={input}
            required
          />
        </section>

        {/* Setting CEISA */}
        <section style={card}>
          <h4>Setting CEISA</h4>
          <label style={label} htmlFor="ceisaUser">Username</label>
          <input
            id="ceisaUser"
            type="text"
            placeholder="CEISA username"
            value={ceisaUser}
            onChange={(e) => setCeisaUser(e.target.value)}
            style={input}
            required
          />

          <label style={label} htmlFor="ceisaPass">Password</label>
          <input
            id="ceisaPass"
            type="password"
            placeholder="CEISA password"
            value={ceisaPass}
            onChange={(e) => setCeisaPass(e.target.value)}
            style={input}
            required
          />

          <div style={{ marginTop: 8 }}>
            <button type="submit" style={{ padding: '8px 14px', borderRadius: 6, border: 'none', background: '#2563eb', color: '#fff' }}>
              Simpan
            </button>
          </div>
        </section>
      </form>
    </div>
  )
}
