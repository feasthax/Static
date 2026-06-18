--!nocheck
-- // @ Services
local HttpService = cloneref(game:GetService("HttpService"))

-- // @ Config
local ApiBase = "https://YOUR_DOMAIN"
local Key = "PASTE_KEY_HERE"

-- // @ Validate
local function ValidateKey()
	local Ok, Response = pcall(function()
		return game:HttpGet(ApiBase .. "/validate?key=" .. HttpService:UrlEncode(Key))
	end)
	if not Ok then return false end

	local Data = HttpService:JSONDecode(Response)
	return Data.valid == true
end

if not ValidateKey() then
	warn("Invalid or expired key. Get one at " .. ApiBase)
	return
end

-- // @ Main
print("Key valid. Loading script...")
