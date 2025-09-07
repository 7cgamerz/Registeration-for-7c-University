        // Function to update URL hash based on active tab
        function updateUrlHash(tabName) {
            const formattedTabName = tabName.replace(/\s+/g, '%20');
            window.location.hash = formattedTabName;
        }
        
        // Function to activate tab based on URL hash
        function activateTabFromHash() {
            const hash = window.location.hash.substring(1); // Remove the # symbol
            if (hash) {
                const decodedHash = decodeURIComponent(hash);
                const tabName = decodedHash.toLowerCase().replace(/\s+/g, '');
                
                // Find the tab with matching data-tab attribute
                const tabs = document.querySelectorAll('.tab');
                let foundTab = null;
                
                tabs.forEach(tab => {
                    const tabData = tab.getAttribute('data-tab');
                    if (tabData === tabName) {
                        foundTab = tab;
                    }
                });
                
                if (foundTab) {
                    // Remove active class from all tabs
                    document.querySelectorAll('.tab').forEach(t => {
                        t.classList.remove('active');
                    });
                    
                    // Add active class to found tab
                    foundTab.classList.add('active');
                    
                    // Hide all tab content
                    document.querySelectorAll('.tab-content').forEach(content => {
                        content.style.display = 'none';
                    });
                    
                    // Show the selected tab content
                    document.getElementById(tabName + 'Tab').style.display = 'block';
                }
            }
        }
        
        // Initialize tab activation from URL hash on page load
        document.addEventListener('DOMContentLoaded', function() {
            activateTabFromHash();
            
            // Also set up hashchange event listener for back/forward navigation
            window.addEventListener('hashchange', activateTabFromHash);
        });
        
        // Tab switching functionality
        document.querySelectorAll('.tab').forEach(tab => {
            tab.addEventListener('click', () => {
                // Remove active class from all tabs
                document.querySelectorAll('.tab').forEach(t => {
                    t.classList.remove('active');
                });
                
                // Add active class to clicked tab
                tab.classList.add('active');
                
                // Hide all tab content
                document.querySelectorAll('.tab-content').forEach(content => {
                    content.style.display = 'none';
                });
                
                // Show the selected tab content
                const tabName = tab.getAttribute('data-tab');
                document.getElementById(tabName + 'Tab').style.display = 'block';
                
                // Update URL hash
                const tabText = tab.textContent;
                updateUrlHash(tabText);
            });
        });
        
        // Form submission functionality
        document.getElementById('contactForm').addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Get form values
            const name = document.getElementById('name').value;
            const email = document.getElementById('email').value;
            const whatsapp = document.getElementById('whatsapp').value;
            
            // Simple validation
            if (!name || !email || !whatsapp) {
                showError('Please fill in all fields');
                return;
            }
            
            if (!isValidEmail(email)) {
                showError('Please enter a valid email address');
                return;
            }
            
            // Generate 6-digit roll number
            const rollno = generateRollNumber();
            
            // Display the roll number
            document.getElementById('rollnoValue').textContent = rollno;
            document.getElementById('rollnoContainer').style.display = 'block';
            
            // Prepare data for Google Sheets
            const formData = new FormData();
            formData.append('Name', name);
            formData.append('Email', email);
            formData.append('WhatsApp', whatsapp);
            formData.append('RollNo', rollno);
            formData.append('Status', 'Pending'); // Default status
            
            // Replace with your Google Apps Script URL
            const scriptURL = 'https://script.google.com/macros/s/AKfycbxFRA78QMMmlzKLsYitFhuS9t8YIUGquVMCf9QLSRipfXYhgUbDiSiJm6rCf1liWOdh/exec';
            
            // Show loading state
            const submitBtn = document.querySelector('#contactForm button');
            const originalText = submitBtn.textContent;
            submitBtn.textContent = 'Submitting...';
            submitBtn.disabled = true;
            
            // Send data to Google Sheets
            fetch(scriptURL, { method: 'POST', body: formData })
                .then(response => response.json())
                .then(data => {
                    if (data.result === 'success') {
                        showSuccess();
                        document.getElementById('contactForm').reset();
                    } else {
                        showError('Error: ' + data.error);
                    }
                })
                .catch(error => {
                    showError('Error: ' + error.message);
                })
                .finally(() => {
                    submitBtn.textContent = originalText;
                    submitBtn.disabled = false;
                });
        });
        
        // Search functionality
        document.getElementById('searchButton').addEventListener('click', function() {
            const rollno = document.getElementById('searchRollNo').value;
            
            if (!rollno || rollno.length !== 6 || isNaN(rollno)) {
                showSearchError('Please enter a valid 6-digit roll number');
                return;
            }
            
            // Show loading state
            const searchBtn = document.getElementById('searchButton');
            const originalText = searchBtn.textContent;
            searchBtn.textContent = 'Searching...';
            searchBtn.disabled = true;
            
            // Replace with your Google Apps Script Web App URL for GET requests
            const scriptURL = 'https://script.google.com/macros/s/AKfycbxFRA78QMMmlzKLsYitFhuS9t8YIUGquVMCf9QLSRipfXYhgUbDiSiJm6rCf1liWOdh/exec' + '?rollno=' + encodeURIComponent(rollno);
            
            // Fetch data from Google Sheets
            fetch(scriptURL)
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Network response was not ok');
                    }
                    return response.json();
                })
                .then(data => {
                    if (data.result === 'success') {
                        displaySearchResult(data.data);
                    } else {
                        showSearchError(data.message || 'No information found for this roll number');
                    }
                    
                    searchBtn.textContent = originalText;
                    searchBtn.disabled = false;
                })
                .catch(error => {
                    showSearchError('Error searching for data: ' + error.message);
                    searchBtn.textContent = originalText;
                    searchBtn.disabled = false;
                });
        });
        
        // Color selection functionality
        let selectedColorType = 'gradient';
        let selectedColorValue = '1a2a6c,b21f1f,fdbb2d';
        
        document.querySelectorAll('.color-option').forEach(option => {
            option.addEventListener('click', function() {
                // Remove active class from all options
                document.querySelectorAll('.color-option').forEach(opt => {
                    opt.classList.remove('active');
                });
                
                // Add active class to clicked option
                this.classList.add('active');
                
                // Update selected color
                selectedColorType = this.getAttribute('data-type');
                selectedColorValue = this.getAttribute('data-value');
                
                // Update card background if already generated
                updateCardBackground();
            });
        });
        
        // Custom color picker functionality
        document.getElementById('customColorPicker').addEventListener('input', function() {
            // Remove active class from all options
            document.querySelectorAll('.color-option').forEach(opt => {
                opt.classList.remove('active');
            });
            
            // Update selected color
            selectedColorType = 'solid';
            selectedColorValue = this.value;
            
            // Update card background if already generated
            updateCardBackground();
        });
        
        // Function to update card background
        function updateCardBackground() {
            const idCard = document.getElementById('idCard');
            
            if (selectedColorType === 'gradient') {
                const colors = selectedColorValue.split(',');
                idCard.style.background = `linear-gradient(135deg, #${colors[0]}, #${colors[1]}, #${colors[2]})`;
            } else {
                idCard.style.background = selectedColorValue;
            }
        }
        
        // ID Card Generation functionality - FIXED TO USE REAL DATA
        document.getElementById('generateIdCard').addEventListener('click', function() {
            const rollno = document.getElementById('idCardRollNo').value;
            const photoInput = document.getElementById('photoInput');
            
            if (!rollno || rollno.length !== 6 || isNaN(rollno)) {
                alert('Please enter a valid 6-digit roll number');
                return;
            }
            
            if (!photoInput.files || photoInput.files.length === 0) {
                alert('Please upload your photo');
                return;
            }
            
            // Show loading state
            const generateBtn = document.getElementById('generateIdCard');
            const originalText = generateBtn.textContent;
            generateBtn.textContent = 'Generating...';
            generateBtn.disabled = true;
            
            // Replace with your Google Apps Script Web App URL for GET requests
            const scriptURL = 'https://script.google.com/macros/s/AKfycbxFRA78QMMmlzKLsYitFhuS9t8YIUGquVMCf9QLSRipfXYhgUbDiSiJm6rCf1liWOdh/exec' + '?rollno=' + encodeURIComponent(rollno);
            
            // Fetch REAL data from Google Sheets
            fetch(scriptURL)
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Network response was not ok');
                    }
                    return response.json();
                })
                .then(data => {
                    if (data.result === 'success') {
                        // Display REAL data on ID card
                        document.getElementById('idName').textContent = data.data.name;
                        document.getElementById('idRollNo').textContent = data.data.rollno;
                        document.getElementById('idStatus').textContent = data.data.status || 'Pending';
                        
                        // Generate a consistent ID number based on roll number
                        document.getElementById('idNumber').textContent = 'IU' + rollno;
                        
                        // Add status class
                        const statusElement = document.getElementById('idStatus');
                        statusElement.className = '';
                        if (data.data.status) {
                            statusElement.classList.add('status', 'status-' + data.data.status.toLowerCase());
                        } else {
                            statusElement.classList.add('status', 'status-pending');
                        }
                        
                        // Apply selected background
                        updateCardBackground();
                        
                        // Display the uploaded photo
                        const file = photoInput.files[0];
                        const reader = new FileReader();
                        
                        reader.onload = function(e) {
                            const photoContainer = document.querySelector('.id-card-photo');
                            photoContainer.innerHTML = '';
                            const img = document.createElement('img');
                            img.src = e.target.result;
                            photoContainer.appendChild(img);
                        };
                        
                        reader.readAsDataURL(file);
                        
                        // Show download button
                        document.getElementById('downloadIdCard').style.display = 'block';
                    } else {
                        alert(data.message || 'No information found for this roll number');
                    }
                    
                    generateBtn.textContent = originalText;
                    generateBtn.disabled = false;
                })
                .catch(error => {
                    alert('Error generating ID card: ' + error.message);
                    generateBtn.textContent = originalText;
                    generateBtn.disabled = false;
                });
        });
        
        // Download ID Card functionality
        document.getElementById('downloadIdCard').addEventListener('click', function() {
            // Use html2canvas to capture the ID card
            const cardElement = document.getElementById('idCard');
            
            // Show loading state on button
            const downloadBtn = document.getElementById('downloadIdCard');
            const originalText = downloadBtn.textContent;
            downloadBtn.textContent = 'Downloading...';
            downloadBtn.disabled = true;
            
            html2canvas(cardElement, {
                scale: 3, // Higher resolution
                logging: false,
                useCORS: true,
                backgroundColor: null
            }).then(function(canvas) {
                // Convert canvas to data URL
                const imageData = canvas.toDataURL('image/png');
                
                // Create download link
                const link = document.createElement('a');
                link.download = 'student-id-card.png';
                link.href = imageData;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                
                // Restore button state
                downloadBtn.textContent = originalText;
                downloadBtn.disabled = false;
            }).catch(function(error) {
                console.error('Error generating card image:', error);
                alert('Error generating ID card image. Please try again.');
                
                // Restore button state
                downloadBtn.textContent = originalText;
                downloadBtn.disabled = false;
            });
        });
        
        function generateRollNumber() {
            // Generate a random 6-digit number
            return Math.floor(100000 + Math.random() * 900000);
        }
        
        function isValidEmail(email) {
            const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            return re.test(email);
        }
        
        function showSuccess() {
            const successElement = document.getElementById('successMessage');
            const errorElement = document.getElementById('errorMessage');
            
            successElement.style.display = 'block';
            errorElement.style.display = 'none';
            
            // Hide success message after 5 seconds
            setTimeout(() => {
                successElement.style.display = 'none';
            }, 5000);
        }
        
        function showError(message) {
            const successElement = document.getElementById('successMessage');
            const errorElement = document.getElementById('errorMessage');
            
            errorElement.textContent = message;
            errorElement.style.display = 'block';
            successElement.style.display = 'none';
            
            // Hide error message after 5 seconds
            setTimeout(() => {
                errorElement.style.display = 'none';
            }, 5000);
        }
        
        function displaySearchResult(data) {
            document.getElementById('resultName').textContent = data.name;
            document.getElementById('resultEmail').textContent = data.email;
            document.getElementById('resultWhatsApp').textContent = data.whatsapp;
            document.getElementById('resultRollNo').textContent = data.rollno;
            
            // Display status with appropriate styling
            const statusElement = document.getElementById('resultStatus');
            statusElement.textContent = data.status || 'Pending';
            statusElement.className = 'status'; // Reset classes
            
            // Add appropriate class based on status
            if (data.status) {
                const statusClass = 'status-' + data.status.toLowerCase();
                statusElement.classList.add(statusClass);
            } else {
                statusElement.classList.add('status-pending');
            }
            
            document.getElementById('searchResults').style.display = 'block';
            document.getElementById('noResults').style.display = 'none';
            document.getElementById('resultsContent').style.display = 'block';
        }
        
        function showSearchError(message) {
            document.getElementById('noResults').textContent = message;
            document.getElementById('searchResults').style.display = 'block';
            document.getElementById('noResults').style.display = 'block';
            document.getElementById('resultsContent').style.display = 'none';
        }
