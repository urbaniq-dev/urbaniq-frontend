import re

with open("/Users/rihenrw/Documents/Projects/Urbaniq/urbaniq-frontend/app/dashboard/owner/properties/new/page.tsx", "r") as f:
    content = f.read()

# 1. Remove STEPS and add steps to component
content = re.sub(
    r"const STEPS = \[\s*\{\s*id: 1, title: 'Basic Info'\s*\},[\s\S]*?\]\s*export default function NewPropertyWizard\(\) \{",
    """export default function NewPropertyWizard() {""",
    content
)

content = re.sub(
    r"const \[commissionInfo, setCommissionInfo\] = useState\(\"\"\)",
    """const [commissionInfo, setCommissionInfo] = useState("")

  const steps = [
    { id: 1, title: 'Basic Info' },
    { id: 2, title: 'Features & Docs' },
    { id: 3, title: 'Location' },
    { id: 4, title: 'Management' },
    ...(managementOption === 'agent' ? [{ id: 5, title: 'Assign Agent' }] : [])
  ]""",
    content
)

# 2. Fix validateStep
content = re.sub(
    r"case 4:\s+if \(managementOption === \"agent\" && !selectedAgentId\) return \"Please select an agent to assign\.\"\s+break",
    """case 4:
        break
      case 5:
        if (!selectedAgentId) return "Please select an agent to assign."
        break""",
    content
)

# 3. Fix handleNext
content = re.sub(
    r"if \(currentStep < STEPS\.length\) \{",
    "if (currentStep < steps.length) {",
    content
)

# 4. Fix Progress Bar
content = re.sub(
    r"List a property in 4 easy steps\.",
    "List a property in {steps.length} easy steps.",
    content
)
content = re.sub(
    r"\(STEPS\.length - 1\)",
    "(steps.length - 1)",
    content
)
content = re.sub(
    r"STEPS\.map",
    "steps.map",
    content
)

# 5. Extract Step 5 from Step 4
content = re.sub(
    r"\{managementOption === 'agent' && \([\s\S]*?className=\"space-y-4\">[\s\S]*?\{agents\.length === 0 \? \([\s\S]*?No verified agents available\.[\s\S]*?\) : \([\s\S]*?agents\.map\(agent => \{[\s\S]*?const stats = getAgentStats\(agent\._id\)[\s\S]*?const isSelected = selectedAgentId === agent\._id[\s\S]*?return \([\s\S]*?key=\{agent\._id\}[\s\S]*?className=\{`flex items-start[\s\S]*?<\/div>[\s\S]*?\)[\s\S]*?\}\)[\s\S]*?\)[\s\S]*?\}[\s\S]*?<\/div>[\s\S]*?<\/div>[\s\S]*?<div className=\"space-y-2\">[\s\S]*?<label className=\"text-sm font-medium\">Commission Structure Note \(Optional\)<\/label>[\s\S]*?<Input [\s\S]*?value=\{commissionInfo\} [\s\S]*?onChange=\{\(e\) => setCommissionInfo\(e\.target\.value\)\} [\s\S]*?placeholder=\"e\.g\. 5% of final sale price\" [\s\S]*?className=\"h-12\"[\s\S]*?\/>[\s\S]*?<p className=\"text-xs text-muted-foreground\">This info will be sent to the agent along with your assignment request\.<\/p>[\s\S]*?<\/div>[\s\S]*?<\/div>[\s\S]*?\)\}",
    """</div>
          )}
          
          {/* STEP 5: Assign Agent */}
          {currentStep === 5 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
              <div>
                <h2 className="text-2xl font-bold tracking-tight mb-2">Assign an Agent</h2>
                <p className="text-muted-foreground">
                  Select a verified Urbaniq agent to handle your listing, communications, and viewings.
                </p>
              </div>

              <div className="space-y-4">
                    <label className="text-sm font-medium">Select Verified Agent</label>
                    <div className="grid sm:grid-cols-2 gap-4 max-h-[400px] overflow-y-auto pr-2 pb-2">
                      {agents.length === 0 ? (
                        <div className="col-span-2 text-center py-8 text-muted-foreground border-2 border-dashed rounded-xl">
                          No verified agents available.
                        </div>
                      ) : (
                        agents.map(agent => {
                          const stats = getAgentStats(agent._id)
                          const isSelected = selectedAgentId === agent._id
                          return (
                            <div
                              key={agent._id}
                              onClick={() => setSelectedAgentId(agent._id)}
                              className={`flex items-start gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all hover:shadow-md ${
                                isSelected ? 'border-primary bg-primary/5 shadow-md' : 'border-border hover:border-primary/50'
                              }`}
                            >
                              <div className="relative shrink-0">
                                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center text-primary font-bold text-lg">
                                  {agent.firstName.charAt(0)}{agent.lastName.charAt(0)}
                                </div>
                                {isSelected && (
                                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                                    <CheckCircle2 className="w-3 h-3 text-white" />
                                  </div>
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-start mb-0.5">
                                  <h4 className="font-semibold text-sm truncate">{agent.firstName} {agent.lastName}</h4>
                                  <div className="flex items-center text-xs text-yellow-500 shrink-0 ml-2">
                                    <Star className="w-3.5 h-3.5 fill-current" />
                                    <span className="ml-1 font-medium text-foreground">{stats.rating}</span>
                                  </div>
                                </div>
                                <p className="text-xs text-muted-foreground truncate mb-2">{agent.email}</p>
                                <div className="flex items-center gap-2 flex-wrap text-[11px]">
                                  <span className="inline-flex items-center gap-1 bg-green-50 text-green-700 border border-green-200 px-1.5 py-0.5 rounded-full">
                                    <ShieldCheck className="w-3 h-3" /> Verified
                                  </span>
                                  <span className="text-muted-foreground">{stats.deals} deals</span>
                                </div>
                              </div>
                            </div>
                          )
                        })
                      )}
                    </div>
                  </div>
                  <div className="space-y-2 mt-6 border-t pt-6">
                    <label className="text-sm font-medium">Commission Structure Note (Optional)</label>
                    <Input 
                      value={commissionInfo} 
                      onChange={(e) => setCommissionInfo(e.target.value)} 
                      placeholder="e.g. 5% of final sale price" 
                      className="h-12"
                    />
                    <p className="text-xs text-muted-foreground">This info will be sent to the agent along with your assignment request.</p>
                  </div>
            </div>
          )}""",
    content
)

# 6. Fix next button condition
content = re.sub(
    r"currentStep < 4 \?",
    "currentStep < steps.length ?",
    content
)

with open("/Users/rihenrw/Documents/Projects/Urbaniq/urbaniq-frontend/app/dashboard/owner/properties/new/page.tsx", "w") as f:
    f.write(content)
