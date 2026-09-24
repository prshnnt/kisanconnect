import React from "react"
import { BrowserRouter, Routes, Route } from "react-router-dom"
import { ThemeProvider } from "@mui/material/styles"
import CssBaseline from "@mui/material/CssBaseline"
import theme from "./theme.js"
import { LanguageProvider } from "./contexts/LanguageContext.jsx"
import { AuthProvider } from "./contexts/AuthContext.jsx"

// Onboarding
import X1Language from "./screens/onboarding/X1Language.jsx"
import X2UserType from "./screens/onboarding/X2UserType.jsx"
import X3Phone from "./screens/onboarding/X3Phone.jsx"
import X4OTP from "./screens/onboarding/X4OTP.jsx"
import X5AboutYou from "./screens/onboarding/X5AboutYou.jsx"
import X6HomeMandi from "./screens/onboarding/X6HomeMandi.jsx"
import X7Welcome from "./screens/onboarding/X7Welcome.jsx"
import X8Login from "./screens/onboarding/X8Login.jsx"

// Farmer
import FarmerShell from "./screens/farmer/FarmerShell.jsx"
import F1Today from "./screens/farmer/F1Today.jsx"
import F2PriceRadar from "./screens/farmer/F2PriceRadar.jsx"
import F3PriceDetail from "./screens/farmer/F3PriceDetail.jsx"
import F4WhatSelling from "./screens/farmer/F4WhatSelling.jsx"
import F5HowMuch from "./screens/farmer/F5HowMuch.jsx"
import F6Quality from "./screens/farmer/F6Quality.jsx"
import F7Where from "./screens/farmer/F7Where.jsx"
import F8MinPrice from "./screens/farmer/F8MinPrice.jsx"
import F9HowToSell from "./screens/farmer/F9HowToSell.jsx"
import F10Review from "./screens/farmer/F10Review.jsx"
import F11MyLots from "./screens/farmer/F11MyLots.jsx"
import F12Offers from "./screens/farmer/F12Offers.jsx"
import F14Deals from "./screens/farmer/F14Deals.jsx"
import F15DealRoom from "./screens/farmer/F15DealRoom.jsx"
import F16Money from "./screens/farmer/F16Money.jsx"
import F17Problem from "./screens/farmer/F17Problem.jsx"
import F19Services from "./screens/farmer/F19Services.jsx"
import F20ServiceDetail from "./screens/farmer/F20ServiceDetail.jsx"
import F21FindBuyers from "./screens/farmer/F21FindBuyers.jsx"
import F23Me from "./screens/farmer/F23Me.jsx"

// Buyer
import BuyerShell from "./screens/buyer/BuyerShell.jsx"
import B1Home from "./screens/buyer/B1Home.jsx"
import B2FindSupply from "./screens/buyer/B2FindSupply.jsx"
import B4PostDemand from "./screens/buyer/B4PostDemand.jsx"
import B5MakeOffer from "./screens/buyer/B5MakeOffer.jsx"
import B6MyDemands from "./screens/buyer/B6MyDemands.jsx"
import B7MyOffers from "./screens/buyer/B7MyOffers.jsx"
import B8DealsList from "./screens/buyer/B8DealsList.jsx"
import B8DealRoom from "./screens/buyer/B8DealRoom.jsx"
import B9Trust from "./screens/buyer/B9Trust.jsx"
import B10MyProfile from "./screens/buyer/B10MyProfile.jsx"

// Agent
import AgentShell from "./screens/agent/AgentShell.jsx"
import A1Today from "./screens/agent/A1Today.jsx"
import A2Farmers from "./screens/agent/A2Farmers.jsx"
import A3Lots from "./screens/agent/A3Lots.jsx"
import A5Money from "./screens/agent/A5Money.jsx"
import A6MyProfile from "./screens/agent/A6MyProfile.jsx"

// Provider
import ProviderShell from "./screens/provider/ProviderShell.jsx"
import S1Jobs from "./screens/provider/S1Jobs.jsx"
import S3Services from "./screens/provider/S3Services.jsx"
import S4Calendar from "./screens/provider/S4Calendar.jsx"
import S5Earnings from "./screens/provider/S5Earnings.jsx"
import S6MyProfile from "./screens/provider/S6MyProfile.jsx"

// Admin
import AdminShell from "./screens/admin/AdminShell.jsx"
import D1Overview from "./screens/admin/D1Overview.jsx"
import D2Approvals from "./screens/admin/D2Approvals.jsx"
import D3LiveOps from "./screens/admin/D3LiveOps.jsx"
import D5Disputes from "./screens/admin/D5Disputes.jsx"
import D7Rules from "./screens/admin/D7Rules.jsx"

export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <LanguageProvider>
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              {/* Onboarding */}
              <Route path="/" element={<X1Language />} />
              <Route path="/user-type" element={<X2UserType />} />
              <Route path="/phone" element={<X3Phone />} />
              <Route path="/otp" element={<X4OTP />} />
              <Route path="/about" element={<X5AboutYou />} />
              <Route path="/home-mandi" element={<X6HomeMandi />} />
              <Route path="/welcome" element={<X7Welcome />} />
              <Route path="/login" element={<X8Login />} />

              {/* Farmer */}
              <Route path="/farmer" element={<FarmerShell />}>
                <Route index element={<F1Today />} />
                <Route path="prices" element={<F2PriceRadar />} />
                <Route path="prices/:mandiId" element={<F3PriceDetail />} />
                <Route path="sell" element={<F4WhatSelling />} />
                <Route path="sell/quantity" element={<F5HowMuch />} />
                <Route path="sell/quality" element={<F6Quality />} />
                <Route path="sell/location" element={<F7Where />} />
                <Route path="sell/min-price" element={<F8MinPrice />} />
                <Route path="sell/how" element={<F9HowToSell />} />
                <Route path="sell/review" element={<F10Review />} />
                <Route path="lots" element={<F11MyLots />} />
                <Route path="lot/:lotId/offers" element={<F12Offers />} />
                <Route path="deals" element={<F14Deals />} />
                <Route path="deal/:dealId" element={<F15DealRoom />} />
                <Route path="money" element={<F16Money />} />
                <Route path="problem" element={<F17Problem />} />
                <Route path="services" element={<F19Services />} />
                <Route
                  path="services/:serviceId"
                  element={<F20ServiceDetail />}
                />
                <Route path="find-buyers" element={<F21FindBuyers />} />
                <Route path="me" element={<F23Me />} />
              </Route>

              {/* Buyer */}
              <Route path="/buyer" element={<BuyerShell />}>
                <Route index element={<B1Home />} />
                <Route path="find" element={<B2FindSupply />} />
                <Route path="demand" element={<B4PostDemand />} />
                <Route path="demands" element={<B6MyDemands />} />
                <Route path="offer" element={<B5MakeOffer />} />
                <Route path="offers" element={<B7MyOffers />} />
                <Route path="deals" element={<B8DealsList />} />
                <Route path="deal/:dealId" element={<B8DealRoom />} />
                <Route path="trust" element={<B9Trust />} />
                <Route path="me" element={<B10MyProfile />} />
              </Route>

              {/* Agent */}
              <Route path="/agent" element={<AgentShell />}>
                <Route index element={<A1Today />} />
                <Route path="farmers" element={<A2Farmers />} />
                <Route path="lots" element={<A3Lots />} />
                <Route path="money" element={<A5Money />} />
                <Route path="me" element={<A6MyProfile />} />
              </Route>

              {/* Service Provider */}
              <Route path="/provider" element={<ProviderShell />}>
                <Route index element={<S1Jobs />} />
                <Route path="calendar" element={<S4Calendar />} />
                <Route path="services" element={<S3Services />} />
                <Route path="earnings" element={<S5Earnings />} />
                <Route path="me" element={<S6MyProfile />} />
              </Route>

              {/* Admin */}
              <Route path="/admin" element={<AdminShell />}>
                <Route index element={<D1Overview />} />
                <Route path="approvals" element={<D2Approvals />} />
                <Route path="liveops" element={<D3LiveOps />} />
                <Route path="money" element={<D1Overview />} />
                <Route path="disputes" element={<D5Disputes />} />
                <Route path="market" element={<D1Overview />} />
                <Route path="rules" element={<D7Rules />} />
                <Route path="people" element={<D2Approvals />} />
              </Route>

              {/* Fallback */}
              <Route path="*" element={<X1Language />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  )
}
