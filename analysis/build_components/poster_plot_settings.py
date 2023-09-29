import seaborn as sns
import matplotlib as plt

# styling for paper_figures

# plot setup
sns.set_style('whitegrid')
plt.rcParams["figure.figsize"] = (4,6)
plt.rcParams['xtick.major.size'] = 6
plt.rcParams['ytick.major.size'] = 6
plt.rcParams['xtick.major.width'] = 2
plt.rcParams['ytick.major.width'] = 2
plt.rcParams['xtick.bottom'] = True
plt.rcParams['ytick.left'] = True
plt.rcParams['font.size'] = 20
plt.rcParams['axes.labelsize'] = 20
plt.rcParams['ytick.labelsize'] = 16
plt.rcParams['xtick.labelsize'] = 16

plt.rcParams['axes.linewidth'] = 2
plt.rcParams['patch.linewidth'] = 0



LIGHT_BLUE = "#56B0CD"
LIGHT_ORANGE = "#FFCE78"
LIGHT_GREEN = "#95C793"
LIGHT_RED = "#CC867A"

BLUE = "#1887ED"
ORANGE = "#FFA300"
GREEN = "#6DC2A0"
RED = "#D52936"

DARK_BLUE   = "#0E4478"
DARK_ORANGE = "#A46400"
DARK_GREEN  = "#275C4A"
DARK_RED    =  "#9B3024"

palette_light = {
    'view': LIGHT_BLUE,
    'build': LIGHT_RED,
    'foil': LIGHT_GREEN
}

palette = {
    'view': BLUE,
    'build': RED,
    'foil': GREEN
}

palette_dark = {
    'view': DARK_BLUE,
    'build': DARK_RED,
    'foil': DARK_GREEN
}

# N=256
# gradients = []

# for light, mid, dark in zip([LIGHT_BLUE,LIGHT_ORANGE,LIGHT_GREEN,LIGHT_RED],[BLUE,ORANGE,GREEN,RED],[DARK_BLUE,DARK_ORANGE,DARK_GREEN,DARK_RED]):
#     light_rgb = list(ImageColor.getcolor(light, "RGB"))
#     mid_rgb = list(ImageColor.getcolor(mid, "RGB"))
#     dark_rgb = list(ImageColor.getcolor(dark, "RGB"))
#     vals = np.ones((N, 4))
#     vals[:, 0] = np.append(np.linspace(light_rgb[0]/255, mid_rgb[0]/255, int(N/2)),np.linspace(mid_rgb[0]/255, dark_rgb[0]/255, int(N/2))) # R
#     vals[:, 1] = np.append(np.linspace(light_rgb[1]/255, mid_rgb[1]/255, int(N/2)),np.linspace(mid_rgb[1]/255, dark_rgb[1]/255, int(N/2))) # G
#     vals[:, 2] = np.append(np.linspace(light_rgb[2]/255, mid_rgb[2]/255, int(N/2)),np.linspace(mid_rgb[2]/255, dark_rgb[2]/255, int(N/2))) # B
#     newcmp = ListedColormap(vals)
    
#     gradients.append(newcmp)

# domain_gradients = {

#     domains[0]:{
#         subdomains[domains[0]][0]: gradients[0],
#         subdomains[domains[0]][1]: gradients[1],
#         subdomains[domains[0]][2]: gradients[2],
#         subdomains[domains[0]][3]: gradients[3],
#     },
#      domains[1]:{
#         subdomains[domains[1]][0]: gradients[0],
#         subdomains[domains[1]][1]: gradients[1],
#         subdomains[domains[1]][2]: gradients[2],
#         subdomains[domains[1]][3]: gradients[3],
#     }
# }
