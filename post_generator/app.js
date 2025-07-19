document.addEventListener('DOMContentLoaded', function() {
            // Tab functionality
            const tabs = document.querySelectorAll('.tab');
            tabs.forEach(tab => {
                tab.addEventListener('click', function() {
                    // Remove active class from all tabs and contents
                    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
                    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
                    
                    // Add active class to clicked tab and corresponding content
                    this.classList.add('active');
                    const tabId = this.getAttribute('data-tab');
                    document.getElementById(`${tabId}-tab`).classList.add('active');
                });
            });
            
            // Background style toggle
            const bgStyle = document.getElementById('bg-style');
            const colorOptionsGroups = document.querySelectorAll('.color-options-group');
            
            bgStyle.addEventListener('change', function() {
                colorOptionsGroups.forEach(group => group.classList.add('hidden'));
                document.getElementById(`${this.value}-color-options`).classList.remove('hidden');
            });
            
            // Color presets
            const colorOptions = document.querySelectorAll('.color-option');
            colorOptions.forEach(option => {
                option.addEventListener('click', function() {
                    // Remove active class from all options
                    colorOptions.forEach(opt => opt.classList.remove('active'));
                    
                    // Add active class to clicked option
                    this.classList.add('active');
                    
                    // Set color picker value
                    document.getElementById('bg-color').value = this.getAttribute('data-color');
                });
            });
            
            // Watermark toggle
            const enableWatermark = document.getElementById('enable-watermark');
            const watermarkOptions = document.getElementById('watermark-options');
            
            enableWatermark.addEventListener('change', function() {
                watermarkOptions.classList.toggle('hidden', !this.checked);
                updateWatermarkPreview();
            });
            
            // Watermark preview
            const watermarkText = document.getElementById('watermark-text');
            const watermarkPreview = document.getElementById('watermark-preview-text');
            
            watermarkText.addEventListener('input', updateWatermarkPreview);
            
            function updateWatermarkPreview() {
                watermarkPreview.textContent = watermarkText.value || '@YourTelegramHandle';
            }
            
            // Export format toggle
            const exportFormat = document.getElementById('export-format');
            const exportQuality = document.getElementById('export-quality');
            
            exportFormat.addEventListener('change', function() {
                exportQuality.disabled = this.value !== 'jpeg';
            });
            
            // Date default to today
            const postDate = document.getElementById('post-date');
            postDate.valueAsDate = new Date();
            
            // Add/remove lines
            const linesContainer = document.getElementById('lines-container');
            const addLineBtn = document.getElementById('add-line');
            
            addLineBtn.addEventListener('click', function() {
                const lineCount = document.querySelectorAll('.line-input').length + 1;
                const lineDiv = document.createElement('div');
                lineDiv.className = 'line-input';
                lineDiv.innerHTML = `
                    <input type="text" class="input-control content-line" placeholder="Enter point ${lineCount}">
                    <button type="button" class="btn btn-danger btn-sm remove-line"><i class="fas fa-times"></i></button>
                `;
                linesContainer.appendChild(lineDiv);
                
                // Add event to new remove button
                lineDiv.querySelector('.remove-line').addEventListener('click', function() {
                    lineDiv.remove();
                });
            });
            
            // Initialize remove buttons for existing lines
            document.querySelectorAll('.remove-line').forEach(btn => {
                btn.addEventListener('click', function() {
                    this.parentElement.remove();
                });
            });
            
            // Generate post
            const generateBtn = document.getElementById('generate-btn');
            const downloadBtn = document.getElementById('download-btn');
            const canvas = document.getElementById('post-preview');
            const ctx = canvas.getContext('2d');
            
            generateBtn.addEventListener('click', function() {
                // Get all input values
                const size = document.querySelector('input[name="post-size"]:checked').value.split('x');
                const width = parseInt(size[0]);
                const height = parseInt(size[1]);
                const bgStyleValue = document.getElementById('bg-style').value;
                const analystName = document.getElementById('analyst-name').value;
                const topic = document.getElementById('topic').value;
                const lines = Array.from(document.querySelectorAll('.content-line')).map(input => input.value).filter(line => line.trim());
                const fontFamily = document.getElementById('font-family').value;
                const textColor = document.getElementById('text-color').value;
                const enableWatermarkChecked = document.getElementById('enable-watermark').checked;
                const watermarkTextValue = document.getElementById('watermark-text').value;
                const watermarkOpacity = parseFloat(document.getElementById('watermark-opacity').value);
                const postDateValue = document.getElementById('post-date').value;
                
                // Set canvas size
                canvas.width = width;
                canvas.height = height;
                
                // Draw background based on style
                if (bgStyleValue === 'solid') {
                    const bgColor = document.getElementById('bg-color').value;
                    ctx.fillStyle = bgColor;
                    ctx.fillRect(0, 0, width, height);
                } else if (bgStyleValue === 'gradient') {
                    const color1 = document.getElementById('gradient-color1').value;
                    const color2 = document.getElementById('gradient-color2').value;
                    const direction = document.getElementById('gradient-direction').value;
                    
                    let gradient;
                    if (direction === 'to right') {
                        gradient = ctx.createLinearGradient(0, 0, width, 0);
                    } else if (direction === 'to bottom') {
                        gradient = ctx.createLinearGradient(0, 0, 0, height);
                    } else { // diagonal
                        gradient = ctx.createLinearGradient(0, 0, width, height);
                    }
                    
                    gradient.addColorStop(0, color1);
                    gradient.addColorStop(1, color2);
                    ctx.fillStyle = gradient;
                    ctx.fillRect(0, 0, width, height);
                } else if (bgStyleValue === 'pattern') {
                    // For a real app, you would implement actual pattern generation
                    // This is a simplified version
                    const bgColor = document.getElementById('bg-color').value;
                    ctx.fillStyle = bgColor;
                    ctx.fillRect(0, 0, width, height);
                    
                    // In a full implementation, you would draw patterns here
                }
                
                // Draw content
                ctx.fillStyle = textColor;
                ctx.textAlign = 'center';
                
                // Add analyst name (top)
                ctx.font = `bold 48px ${fontFamily}`;
                ctx.fillText(analystName, width/2, 100);
                
                // Add date if available
                if (postDateValue) {
                    const date = new Date(postDateValue);
                    const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
                    ctx.font = `24px ${fontFamily}`;
                    ctx.fillText(dateStr, width/2, 150);
                }
                
                // Add topic (middle)
                ctx.font = `bold 60px ${fontFamily}`;
                
                // Split topic into multiple lines if too long
                const maxTopicWidth = width * 0.8;
                let yPosition = height/2 - 50;
                const topicLines = wrapText(ctx, topic, width/2, yPosition, maxTopicWidth, 60);
                yPosition += (topicLines * 70); // Adjust for wrapped lines
                
                // Add content lines
                ctx.font = `36px ${fontFamily}`;
                yPosition += 30; // Add some spacing after topic
                
                // Draw each content line
                lines.forEach(line => {
                    if (line.trim()) {
                        const linesDrawn = wrapText(ctx, line, width/2, yPosition, maxTopicWidth, 40);
                        yPosition += (linesDrawn * 50); // Adjust for wrapped lines
                    }
                });
                
                // Add watermark if enabled
                if (enableWatermarkChecked && watermarkTextValue) {
                    ctx.save();
                    ctx.font = `bold 24px ${fontFamily}`;
                    ctx.globalAlpha = watermarkOpacity;
                    ctx.fillStyle = textColor;
                    ctx.rotate(-0.2);
                    
                    // Create a pattern of watermarks
                    const watermarkSpacing = 200;
                    for (let x = -width; x < width * 2; x += watermarkSpacing) {
                        for (let y = -height; y < height * 2; y += watermarkSpacing) {
                            ctx.fillText(watermarkTextValue, x, y);
                        }
                    }
                    
                    ctx.restore();
                }
                
                // Show download button
                downloadBtn.classList.remove('hidden');
            });
            
            // Helper function to wrap text and return number of lines drawn
            function wrapText(context, text, x, y, maxWidth, lineHeight) {
                const words = text.split(' ');
                let line = '';
                let lineCount = 0;
                
                for (let n = 0; n < words.length; n++) {
                    const testLine = line + words[n] + ' ';
                    const metrics = context.measureText(testLine);
                    const testWidth = metrics.width;
                    
                    if (testWidth > maxWidth && n > 0) {
                        context.fillText(line, x, y + (lineCount * lineHeight));
                        line = words[n] + ' ';
                        lineCount++;
                    } else {
                        line = testLine;
                    }
                }
                
                context.fillText(line, x, y + (lineCount * lineHeight));
                return lineCount + 1; // Return total lines drawn (including the last one)
            }
            
            // Download post
            downloadBtn.addEventListener('click', function() {
                const exportFormatValue = document.getElementById('export-format').value;
                const exportQualityValue = parseFloat(document.getElementById('export-quality').value);
                const analystName = document.getElementById('analyst-name').value.replace(/\s+/g, '-').toLowerCase();
                const topic = document.getElementById('topic').value.replace(/\s+/g, '-').toLowerCase();
                
                let mimeType, fileName;
                if (exportFormatValue === 'jpeg') {
                    mimeType = 'image/jpeg';
                    fileName = `trading-tip-${analystName}-${topic}.jpg`;
                } else {
                    mimeType = 'image/png';
                    fileName = `trading-tip-${analystName}-${topic}.png`;
                }
                
                const link = document.createElement('a');
                link.download = fileName;
                link.href = canvas.toDataURL(mimeType, exportQualityValue);
                link.click();
            });
        });