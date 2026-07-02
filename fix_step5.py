import re

with open("/Users/rihenrw/Documents/Projects/Urbaniq/urbaniq-frontend/app/dashboard/owner/properties/new/page.tsx", "r") as f:
    content = f.read()

# Add missing icons
content = re.sub(
    r'import \{ Building2, MapPin, ListPlus, Users, UserPlus, CheckCircle2, ChevronRight, ChevronLeft, Map as MapIcon, UploadCloud, Star, ShieldCheck, User \} from "lucide-react"',
    'import { Building2, MapPin, ListPlus, Users, UserPlus, CheckCircle2, ChevronRight, ChevronLeft, Map as MapIcon, UploadCloud, Star, ShieldCheck, User, Search, X, Mail, Phone, Briefcase, TrendingUp, Award, ArrowRight } from "lucide-react"',
    content
)

# Expand getAgentStats to include the full stats
content = re.sub(
    r'    rating: \(4\.5 \+ \(hash % 5\) \* 0\.1\)\.toFixed\(1\),\n    deals: 18 \+ \(hash % 120\),\n  \}',
    '''    rating: (4.5 + (hash % 5) * 0.1).toFixed(1),
    deals: 18 + (hash % 120),
    reviews: 12 + (hash % 80),
    years: 2 + (hash % 12),
    specialty: ["Residential", "Commercial", "Luxury", "Investment", "Rental"][hash % 5],
    city: ["New York", "Los Angeles", "Chicago", "Miami", "Austin"][hash % 5],
  }''',
    content
)

# Add search and preview state variables
content = re.sub(
    r'const \[selectedAgentId, setSelectedAgentId\] = useState\(""\)',
    'const [selectedAgentId, setSelectedAgentId] = useState("")\n  const [searchTerm, setSearchTerm] = useState("")\n  const [previewAgent, setPreviewAgent] = useState<Agent | null>(null)',
    content
)

# Replace step 5 JSX
step5_old = re.compile(r'\{\/\* STEP 5: Assign Agent \*\/\}[\s\S]*?(?=\{\/\* Error Message \*\/|\{\/\* Navigation Buttons \*\/)', re.MULTILINE)

step5_new = """{/* STEP 5: Assign Agent */}
          {currentStep === 5 && (() => {
            const filteredAgents = agents.filter(a =>
              `${a.firstName} ${a.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
              a.email.toLowerCase().includes(searchTerm.toLowerCase())
            )
            const activeAgent = previewAgent || agents.find(a => a._id === selectedAgentId)

            return (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
                <div>
                  <h2 className="text-2xl font-bold tracking-tight mb-2">Select a Verified Agent</h2>
                  <p className="text-muted-foreground">
                    Choose a certified Urbaniq professional to manage your listing.
                  </p>
                </div>

                <div className="grid lg:grid-cols-5 gap-6 items-start">
                  {/* LEFT PANEL: Agent Grid */}
                  <div className={`space-y-4 ${activeAgent ? "lg:col-span-3" : "lg:col-span-5"}`}>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search by name or email..."
                        className="pl-10"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4 max-h-[450px] overflow-y-auto pr-1">
                      {filteredAgents.length === 0 ? (
                        <div className="col-span-2 text-center py-16 text-muted-foreground border-2 border-dashed rounded-xl">
                          No agents found matching your search.
                        </div>
                      ) : (
                        filteredAgents.map(agent => {
                          const stats = getAgentStats(agent._id)
                          const isSelected = selectedAgentId === agent._id
                          const isPreviewing = previewAgent?._id === agent._id
                          return (
                            <button
                              key={agent._id}
                              type="button"
                              onClick={() => { setPreviewAgent(agent); setError("") }}
                              className={`text-left w-full rounded-xl border-2 p-5 transition-all duration-200 group hover:shadow-md ${
                                isSelected
                                  ? "border-primary bg-primary/5 shadow-md"
                                  : isPreviewing
                                  ? "border-primary/50 bg-primary/[0.03]"
                                  : "border-border hover:border-primary/30 bg-background"
                              }`}
                            >
                              <div className="flex items-start gap-4">
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
                                  <div className="flex items-center justify-between mb-0.5">
                                    <h3 className="font-semibold truncate text-base">{agent.firstName} {agent.lastName}</h3>
                                    <span className="flex items-center gap-1 text-sm text-yellow-500 shrink-0 ml-2">
                                      <Star className="w-3.5 h-3.5 fill-current" />
                                      <span className="font-medium text-foreground">{stats.rating}</span>
                                    </span>
                                  </div>
                                  <p className="text-xs text-muted-foreground truncate mb-2">{agent.email}</p>
                                  <div className="flex items-center gap-3 flex-wrap">
                                    <span className="inline-flex items-center gap-1 text-xs bg-green-50 text-green-700 border border-green-200 px-2 py-0.5 rounded-full">
                                      <ShieldCheck className="w-3 h-3" /> Verified
                                    </span>
                                    <span className="text-xs text-muted-foreground">{stats.deals} deals</span>
                                  </div>
                                </div>
                              </div>
                            </button>
                          )
                        })
                      )}
                    </div>
                  </div>

                  {/* RIGHT PANEL: Agent Detail */}
                  {activeAgent && (
                    <div className="lg:col-span-2 space-y-4">
                      <div className="overflow-hidden border border-primary/20 shadow-lg rounded-xl bg-card text-card-foreground">
                        <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-6 border-b relative">
                          <button
                            type="button"
                            onClick={() => setPreviewAgent(null)}
                            className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-muted text-muted-foreground transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                          <div className="flex items-center gap-4">
                            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary/40 to-primary/15 flex items-center justify-center text-primary font-bold text-2xl shadow-inner">
                              {activeAgent.firstName.charAt(0)}{activeAgent.lastName.charAt(0)}
                            </div>
                            <div>
                              <h2 className="text-xl font-bold">{activeAgent.firstName} {activeAgent.lastName}</h2>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="inline-flex items-center gap-1 text-xs bg-green-50 text-green-700 border border-green-200 px-2 py-0.5 rounded-full">
                                  <ShieldCheck className="w-3 h-3" /> Verified
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="p-6 space-y-5">
                          <div className="grid grid-cols-3 gap-3 text-center">
                            <div className="bg-muted/50 rounded-lg p-3">
                              <p className="text-xl font-bold text-primary">{getAgentStats(activeAgent._id).deals}</p>
                              <p className="text-xs text-muted-foreground mt-0.5">Deals</p>
                            </div>
                            <div className="bg-muted/50 rounded-lg p-3">
                              <p className="text-xl font-bold text-primary">{getAgentStats(activeAgent._id).years}+</p>
                              <p className="text-xs text-muted-foreground mt-0.5">Yrs Exp</p>
                            </div>
                            <div className="bg-muted/50 rounded-lg p-3">
                              <p className="text-xl font-bold text-primary">{getAgentStats(activeAgent._id).rating}</p>
                              <p className="text-xs text-muted-foreground mt-0.5">Rating</p>
                            </div>
                          </div>
                          <div className="space-y-3">
                            <div className="flex items-center gap-3 text-sm">
                              <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center shrink-0">
                                <Mail className="w-4 h-4 text-muted-foreground" />
                              </div>
                              <span className="text-muted-foreground truncate">{activeAgent.email}</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm">
                              <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center shrink-0">
                                <Briefcase className="w-4 h-4 text-muted-foreground" />
                              </div>
                              <span className="text-muted-foreground">{getAgentStats(activeAgent._id).specialty} Specialist</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm">
                              <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center shrink-0">
                                <MapPin className="w-4 h-4 text-muted-foreground" />
                              </div>
                              <span className="text-muted-foreground">{getAgentStats(activeAgent._id).city} Market Expert</span>
                            </div>
                          </div>
                          {selectedAgentId === activeAgent._id ? (
                            <Button
                              type="button"
                              variant="outline"
                              className="w-full"
                              onClick={() => setSelectedAgentId("")}
                            >
                              <X className="w-4 h-4 mr-2" /> Deselect Agent
                            </Button>
                          ) : (
                            <Button
                              type="button"
                              className="w-full"
                              onClick={() => { setSelectedAgentId(activeAgent._id); setPreviewAgent(null) }}
                            >
                              <CheckCircle2 className="w-4 h-4 mr-2" /> Select This Agent
                            </Button>
                          )}
                        </div>
                      </div>

                      {/* Commission Note */}
                      {selectedAgentId === activeAgent._id && (
                        <div className="space-y-2 mt-4">
                          <label className="text-sm font-medium">Commission Structure Note (Optional)</label>
                          <Input
                            value={commissionInfo}
                            onChange={(e) => setCommissionInfo(e.target.value)}
                            placeholder="e.g. 5% of final sale price"
                            className="bg-background"
                          />
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )
          })()}
          """

content = step5_old.sub(step5_new, content)

with open("/Users/rihenrw/Documents/Projects/Urbaniq/urbaniq-frontend/app/dashboard/owner/properties/new/page.tsx", "w") as f:
    f.write(content)
