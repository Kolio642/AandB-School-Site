# Hosting Your Next.js Website on Microsoft Azure

This guide provides detailed instructions for setting up and deploying your Next.js website on Microsoft Azure. Using Azure provides a reliable cloud-based hosting solution without requiring your local computer to run resource-intensive virtual machines.

## Table of Contents

1. [Introduction to Azure](#introduction-to-azure)
2. [Setting Up an Azure Account](#setting-up-an-azure-account)
3. [Creating a Virtual Machine in Azure](#creating-a-virtual-machine-in-azure)
4. [Initial Access and Setup](#initial-access-and-setup)
5. [Setting Up the Web Server Environment](#setting-up-the-web-server-environment)
6. [Deploying Your Next.js Application](#deploying-your-next-js-application)
7. [Configuring Domain and SSL](#configuring-domain-and-ssl)
8. [Maintenance and Cost Management](#maintenance-and-cost-management)
9. [Troubleshooting](#troubleshooting)

## Introduction to Azure

Microsoft Azure is a cloud computing platform that provides a wide range of services, including virtual machines, web apps, databases, and more. For hosting a Next.js website, we'll use Azure Virtual Machines, which provides the flexibility to configure your server exactly as needed.

**Benefits of Azure for hosting:**
- No local hardware requirements
- Pay-as-you-go pricing model
- High availability and reliability
- Easy scaling as your website grows
- Built-in security features
- Global datacenter network for faster access

## Setting Up an Azure Account

1. **Activate Azure for Students**:
   - Go to [Azure for Students](https://azure.microsoft.com/free/students)
   - Sign in with your educational email account
   - Complete the verification process
   - Your educational benefits include:
     - $100 in Azure credits (renewed annually)
     - Free access to many popular services
     - No credit card required for signup
     - Access to developer and learning resources
     - Free access to software and developer tools through Azure Dev Tools for Teaching

2. **Educational Benefits Overview**:
   - **Free Services**:
     - Linux virtual machines (B1s) with limited hours
     - Web Apps
     - Azure Database services
     - AI and Machine Learning services
   - **Learning Resources**:
     - Microsoft Learn for Students
     - Azure certification training
     - GitHub Student Developer Pack
   - **Development Tools**:
     - Visual Studio Enterprise subscription
     - Windows Server and SQL Server for development/testing

3. **Cost Management for Students**:
   - Monitor your credit usage in Azure Portal
   - Set up spending alerts to avoid exceeding credits
   - Use auto-shutdown for VMs when not in use
   - Choose cost-effective options (B-series VMs)
   - Your $100 credit can last several months with proper management

4. **Install Azure CLI** (optional but recommended):
   - This command-line tool helps manage Azure resources
   - [Download from Microsoft](https://docs.microsoft.com/en-us/cli/azure/install-azure-cli)
   - Verify installation: `az --version`

## Creating a Virtual Machine in Azure

1. **Log in to Azure Portal**:
   - Go to [portal.azure.com](https://portal.azure.com)
   - Sign in with your account

2. **Create a Resource Group**:
   - Click "Resource groups" in the left menu
   - Click "Create"
   - Enter a name (e.g., "AandB-Resources")
   - Select a region close to your target audience
   - Click "Review + create", then "Create"

3. **Create a Virtual Machine**:
   - Click "Create a resource" in the top left
   - Search for "Virtual machine" and select it
   - Click "Create"

4. **Basic Settings**:
   - Resource group: Select the one you created
   - Virtual machine name: "AandB-WebServer"
   - Region: Choose the same as your resource group
   - Security type: Select "Trusted launch virtual machines" (recommended)
   - Image: Ubuntu Server 22.04 LTS - x64 Gen2
   - Size: Standard_B2ats_v2 (2 vCPUs, 1 GB memory) - **Free for students within credit limits**
     - Perfect for Next.js development and light production use
     - Alternative: B1s if you need to conserve credits

   **Why B2ats_v2 is optimal:**
   - **Performance Metrics:**
     - 2 vCPUs: Ideal for Next.js server-side rendering
     - 3750 IOPS: Good disk performance for database operations
     - 4 GB disk: Sufficient for OS and application
     - Low eviction rate (0-5%): Better stability
   
   - **Cost Efficiency:**
     - Lowest cost per hour ($0.00772)
     - 35% savings compared to regular pricing
     - Free under student credits
     - Best price-to-performance ratio for Next.js hosting

   - **Compared to Alternatives:**
     ```
     VM Size    | vCPUs | RAM | IOPS | Cost/hr  | Benefits
     -----------|-------|-----|------|----------|----------
     B2ats_v2  | 2     | 1GB | 3750 | $0.00772 | Best for Next.js
     F1s       | 1     | 2GB | 3200 | $0.00813 | More RAM but slower
     B2ts_v2   | 2     | 1GB | 3750 | $0.00856 | Similar but costlier
     D2ls_v5   | 2     | 4GB | 3750 | $0.01588 | Overkill for needs
     ```

   - **Resource Management Tips:**
     - Use swap space for memory management
     - Enable compression for better RAM utilization
     - Implement proper caching strategies
     - Monitor resource usage with Azure metrics

   - **When to consider upgrading:**
   - If you consistently see out-of-memory errors despite optimizations
   - When your daily active users exceed 1000
   - If you're running memory-intensive background tasks
   - When your student credits are exhausted and you have budget for production hosting
   - Authentication type: Choose between:
     - Password (simpler but less secure)
     - SSH public key (recommended for production)
   - Username: Enter a username
   - Password/SSH key: Set up according to your chosen authentication method

5. **Additional Security Features**:
   - Enable "Trusted launch" for enhanced security
   - Configure basic security features
   - Enable Azure Security Center (free tier)
   - Consider enabling boot diagnostics for troubleshooting

6. **Disks**:
   - OS disk type: Standard SSD (for balance of cost and performance)
   - Size: 30 GB is sufficient for most websites

7. **Networking**:
   - Virtual network: Keep default (new VNet will be created)
   - Public IP: Keep default (new IP will be created)
   - NIC network security group: Basic
   - Public inbound ports: Allow SSH
   - Load balancing: None (for single VM setup)

   **Note on Load Balancing:**
   - Not needed for single VM deployments
   - Consider adding load balancing when:
     - Your daily active users exceed 5,000
     - You need 99.99% uptime
     - You're running multiple VM instances
   - Types available:
     - Azure Load Balancer: For TCP/UDP traffic
     - Application Gateway: For HTTP/HTTPS with advanced features
   - Cost implications:
     - Basic Load Balancer: Free
     - Standard Load Balancer: Additional costs
     - Application Gateway: Higher costs but more features

8. **Management**:
   - Boot diagnostics: Enable with managed storage account
   - Auto-shutdown: Consider enabling to save costs when not in use
   - Other options: Default settings are fine

9. **Review and Create**:
   - Review your settings
   - Click "Create"
   - Wait for deployment to complete (usually takes a few minutes)

**Memory Management Tips for 1GB RAM**:
1. Enable swap space after setup:
   ```bash
   # Create a 2GB swap file
   sudo fallocate -l 2G /swapfile
   sudo chmod 600 /swapfile
   sudo mkswap /swapfile
   sudo swapon /swapfile
   
   # Make swap permanent
   echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
   ```

2. Optimize Next.js production build:
   ```bash
   # In your next.config.js
   module.exports = {
     experimental: {
       optimizeCss: true // reduces CSS footprint
     },
     swcMinify: true // uses SWC for minification (more memory efficient)
   }
   ```

3. Configure PM2 with memory limits:
   ```bash
   pm2 start npm --name "a-and-b-website" -- start --max-memory-restart 750M
   ```

## Initial Access and Setup

1. **Get VM Connection Information**:
   - Go to your VM in Azure Portal
   - Click "Connect" in the left menu
   - Note down your VM's public IP address
   - Download your .pem key file (save it securely)

2. **Connect via SSH** (from Windows):
   ```bash
   # Using .pem key file (Recommended)
   ssh -i path/to/your/keyfile.pem yourusername@your-vm-ip

   # Example:
   ssh -i C:\Users\username\Downloads\AandB-WebServer_key.pem Kolio642@51.107.27.35
   ```

   **Important Key File Notes**:
   - Keep your .pem file secure and private
   - Never share your key file
   - Store it in a known location on your computer
   - If using WSL or Linux, run: `chmod 400 path/to/your/keyfile.pem`

   **For New PowerShell Session**:
   1. Open PowerShell
   2. Navigate to the directory containing your .pem file, or use full path
   3. Run the SSH command with the -i flag pointing to your key file

3. **First-Time Setup Checklist**:
   ```bash
   # 1. Update system
   sudo apt update
   sudo apt upgrade -y

   # 2. Set up swap space (important for 1GB RAM)
   sudo fallocate -l 2G /swapfile
   sudo chmod 600 /swapfile
   sudo mkswap /swapfile
   sudo swapon /swapfile
   echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab

   # 3. Install essential tools
   sudo apt install -y curl wget unzip git htop

   # 4. Install Node.js
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs

   # 5. Install Nginx
   sudo apt install -y nginx
   sudo systemctl start nginx
   sudo systemctl enable nginx

   # 6. Configure firewall
   sudo apt install -y ufw
   sudo ufw allow OpenSSH
   sudo ufw allow 'Nginx Full'
   sudo ufw --force enable

   # 7. Install PM2 process manager
   sudo npm install -g pm2

   # 8. Verify installation
   node -v
   npm -v
   sudo systemctl status nginx
   ```

4. **Test Web Server**:
   - Open your browser
   - Visit `http://your-vm-ip`
   - You should see the Nginx welcome page

5. **Common Connection Issues**:
   - If SSH connection fails:
     - Verify the IP address is correct
     - Check that port 22 is open in Azure Network Security Group
     - Ensure you're using the correct username
   - If web server isn't accessible:
     - Check that port 80 is open in Azure Network Security Group
     - Verify Nginx is running: `sudo systemctl status nginx`
     - Check Nginx logs: `sudo tail -f /var/log/nginx/error.log`

6. **Next Steps**:
   - Deploy your Next.js application (see "Deploying Your Next.js Application" section)
   - Configure SSL certificates
   - Set up domain name (if you have one)

## Setting Up the Web Server Environment

1. **Install Node.js and npm**:
   ```
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs
   
   # Verify installation
   node -v  # Should show v18.x.x
   npm -v   # Should show 8.x.x or higher
   ```

2. **Install Nginx Web Server**:
   ```
   sudo apt install -y nginx
   
   # Start and enable Nginx
   sudo systemctl start nginx
   sudo systemctl enable nginx
   
   # Check status
   sudo systemctl status nginx
   ```

3. **Configure Firewall**:
   ```
   sudo apt install -y ufw
   sudo ufw allow OpenSSH
   sudo ufw allow 'Nginx Full'
   sudo ufw enable
   ```

4. **Open HTTP and HTTPS ports in Azure**:
   - Go to your VM in Azure Portal
   - Click "Networking" in the left menu
   - Click "Add inbound port rule"
   - Add rule for HTTP:
     - Destination port ranges: 80
     - Name: HTTP
     - Click "Add"
   - Repeat for HTTPS (port 443)

5. **Install PM2 Process Manager** (keeps your Next.js app running):
   ```
   sudo npm install -g pm2
   ```

## Deploying Your Next.js Application

1. **Create deployment directory**:
   ```
   sudo mkdir -p /var/www/aandbnext
   sudo chown $USER:$USER /var/www/aandbnext
   ```

2. **Transfer your application files**:
   - **Option 1**: Use Git (if your code is in a repository)
     ```
     cd /var/www/aandbnext
     git clone <your-repository-url> .
     ```
   
   - **Option 2**: Use SCP/SFTP from your local machine
     - From your local computer, use an SFTP client like FileZilla or WinSCP
     - Connect using:
       - Host: Your VM's IP address
       - Port: 22 (SSH)
       - Username: Your VM username
       - Password: Your VM password
     - Upload your project files to /var/www/aandbnext
   
   - **Option 3**: For smaller projects, you can use SCP:
     ```
     # Run this from your local machine
     scp -r /path/to/local/project username@your-vm-ip:/var/www/aandbnext
     ```

3. **Setup environment variables**:
   ```
   cd /var/www/aandbnext
   nano .env.local
   ```
   
   Add your Supabase environment variables:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   ```

4. **Install dependencies and build the app**:
   ```
   cd /var/www/aandbnext
   npm install
   npm run build
   ```

5. **Start the application with PM2**:
   ```
   pm2 start npm --name "a-and-b-website" -- start
   
   # Configure PM2 to start on boot
   pm2 save
   pm2 startup
   # Run the command that PM2 outputs
   ```

## Configuring Domain and SSL

1. **Create an Nginx server block**:
   ```
   sudo nano /etc/nginx/sites-available/aandbnext
   ```

2. **Add this basic configuration**:
   ```nginx
   server {
       listen 80;
       server_name _;  # Replace with your domain when you have one
       
       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

3. **Enable the site**:
   ```
   sudo ln -s /etc/nginx/sites-available/aandbnext /etc/nginx/sites-enabled/
   sudo nginx -t  # Test the configuration
   sudo systemctl restart nginx
   ```

4. **Accessing your site**:
   - At this point, you can access your site using your VM's public IP address

5. **Setting up a domain** (when you're ready):
   - Purchase a domain from a registrar (Namecheap, GoDaddy, etc.)
   - Create a DNS A record pointing to your Azure VM's IP address
   - Update your Nginx configuration:
     ```
     sudo nano /etc/nginx/sites-available/aandbnext
     ```
     Change `server_name _;` to `server_name yourdomain.com www.yourdomain.com;`
   - Restart Nginx: `sudo systemctl restart nginx`

6. **Adding SSL with Let's Encrypt** (after domain setup):
   ```
   sudo apt install -y certbot python3-certbot-nginx
   sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
   ```
   Follow the prompts to complete the certificate installation

## Maintenance and Cost Management

1. **Regular system updates**:
   ```
   sudo apt update
   sudo apt upgrade -y
   ```

2. **Updating your application**:
   ```
   cd /var/www/aandbnext
   git pull  # If using Git
   npm install
   npm run build
   pm2 restart a-and-b-website
   ```

3. **Monitoring your application**:
   ```
   # Check application status
   pm2 status
   
   # View logs
   pm2 logs a-and-b-website
   
   # System resource usage
   htop
   ```

4. **Azure cost management**:
   - **Student-specific monitoring**:
     - In Azure Portal, go to "Education" hub
     - Monitor your student credit balance
     - View remaining free service quotas
   
   - **Cost-saving strategies for students**:
     - Use B1s instances (included in student credits)
     - Enable auto-shutdown during non-working hours
     - Clean up unused resources immediately
     - Use Azure App Service free tier when possible
     - Leverage free student services before paid ones
   
   - **Typical costs with student benefits**: 
     - B1s VM: Covered by credits (~$7-10/month value)
     - Storage: Minimal cost (~$1-2/month)
     - Bandwidth: Free tier available
     - Your $100 credit can last 6-8 months with proper management

   - **Credit preservation tips**:
     - Schedule VM auto-shutdown during non-working hours
     - Use Azure App Service free tier for development
     - Delete test resources promptly
     - Monitor usage weekly
     - Set up budget alerts at 50% and 75% of credit usage

5. **Backing up your VM**:
   - In Azure Portal, go to your VM
   - Click "Backup" in the left menu
   - Follow the prompts to set up regular backups

## Troubleshooting

### Connection Issues
- **Can't connect to VM**:
  - Verify the VM is running in Azure Portal
  - Check Network Security Group settings
  - Ensure you're using the correct username/password
  - Verify that port 22 is open

### Website Not Loading
- **Check if Nginx is running**:
  ```
  sudo systemctl status nginx
  ```
- **Check Node.js app status**:
  ```
  pm2 status
  pm2 logs a-and-b-website
  ```
- **Check Nginx logs**:
  ```
  sudo tail -f /var/log/nginx/error.log
  ```

### Performance Issues
- **Check system resources**:
  ```
  htop
  ```
- **Check disk space**:
  ```
  df -h
  ```
- **Consider upgrading VM size** if consistently hitting resource limits

### Domain or SSL Issues
- **SSL certificate not working**:
  ```
  sudo certbot certificates  # Check certificate status
  sudo certbot renew --dry-run  # Test renewal process
  ```
- **Domain not resolving**:
  - Check DNS settings at your domain registrar
  - Verify that the A record points to your VM's IP
  - Use `dig yourdomain.com` to check DNS propagation

---

By using Azure to host your Next.js website, you get the benefits of cloud hosting without the resource demands of running a VM locally. This approach provides better reliability, scalability, and accessibility for your website. 