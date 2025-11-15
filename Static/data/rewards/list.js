(function () {
  const AppData = window.AppData || (window.AppData = {});
  AppData.REWARDS = [
    {
      id: 1,
      name: "Fortnum & Mason Afternoon Tea",
      description: "Premium afternoon tea experience for two, delivered to your door.",
      pointsCost: 400,
      icon: "gift",
      category: "experience",
      provider: "Fortnum & Mason",
      image: "linear-gradient(135deg, #9457ff 0%, #4e0dff 100%)",
      remaining: 6,
      published: false
    },
    {
      id: 2,
      name: "Selfridges Gift Card",
      description: "Digital gift card redeemable online or in-store.",
      pointsCost: 280,
      icon: "gift",
      category: "voucher",
      provider: "Selfridges & Co",
      image: "linear-gradient(135deg, #ff8a80 0%, #ff416c 100%)",
      remaining: 12,
      published: false
    },
    {
      id: 3,
      name: "Margot & Montanez Chocolate Hamper",
      description: "Limited edition artisan chocolate selection to celebrate vigilance.",
      pointsCost: 120,
      icon: "gift",
      category: "merchandise",
      provider: "Margot & Montanez",
      image: "linear-gradient(135deg, #ffbe0b 0%, #fb5607 100%)",
      remaining: 20,
      published: false
    },
    {
      id: 4,
      name: "Weld Champion Hoodie",
      description: "Exclusive Weld hoodie for team members leading the risk scoreboard.",
      pointsCost: 260,
      icon: "gift",
      category: "merchandise",
      provider: "Weld Apparel",
      image: "linear-gradient(135deg, #0ea5e9 0%, #2563eb 100%)",
      remaining: 15,
      published: false
    },
    {
      id: 5,
      name: "Amazon Gift Card",
      description: "Digital code redeemable across Amazon.co.uk for everyday essentials or treats.",
      pointsCost: 220,
      icon: "gift",
      category: "voucher",
      provider: "Amazon UK",
      image: "linear-gradient(135deg, #f97316 0%, #facc15 100%)",
      remaining: 18,
      published: true
    },
    {
      id: 6,
      name: "Plant a Tree",
      description: "Fund the planting of a tree through our sustainability partner.",
      pointsCost: 150,
      icon: "gift",
      category: "sustainability",
      provider: "Green Earth Collective",
      image: "linear-gradient(135deg, #22c55e 0%, #0ea5e9 100%)",
      remaining: 40,
      published: true
    },
    {
      id: 7,
      name: "Extra Day of Annual Leave",
      description: "Enjoy an additional day of paid leave approved by your manager.",
      pointsCost: 480,
      icon: "gift",
      category: "benefit",
      provider: "People Team",
      image: "linear-gradient(135deg, #818cf8 0%, #312e81 100%)",
      remaining: 5,
      published: false
    },
    {
      id: 8,
      name: "Donate to Charity",
      description: "Direct a WeldSecure-supported donation to a charitable partner of your choice.",
      pointsCost: 180,
      icon: "gift",
      category: "charity",
      provider: "WeldSecure Giving",
      image: "linear-gradient(135deg, #f472b6 0%, #ec4899 100%)",
      remaining: null,
      unlimited: true,
      published: true
    },
    {
      id: 9,
      name: "Contribute to Work Social Event",
      description: "Add funds to enhance the next team social experience.",
      pointsCost: 140,
      icon: "gift",
      category: "culture",
      provider: "Employee Engagement",
      image: "linear-gradient(135deg, #38bdf8 0%, #6366f1 100%)",
      remaining: 25,
      published: false
    }
  ];

  const modules = window.WeldModules;
  if (modules && (!modules.has || !modules.has("data/rewards/list"))) {
    modules.define("data/rewards/list", () => AppData.REWARDS || []);
  }
})();

