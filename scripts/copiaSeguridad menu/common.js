
const Imported          = window.opener ? window.opener.Imported : null;
const RpgMakerUtils     = window.opener ? window.opener.Utils : null;
const RpgMakerName      = RpgMakerUtils ? RpgMakerUtils.RPGMAKER_NAME : 'MZ';
const UICustom          = window.opener ? window.opener.UICustom : null;

const isImmuneConfigField = (field) => (
    field == 'elementVisibilities' ||
    field == 'elementIcons' ||
    field == 'usePages' ||
    /page\d+Label/i.test(field) ||
    /page\d+Icon/i.test(field) ||
    /page\d+visible/i.test(field) ||
    /visibility\w+Page\d+/i.test(field)
);


$(document).ready(() => $(RpgMakerName == 'MZ' ? '.mv' : '.mz').hide());

$(document).ready(() =>
    $('.initially-hidden')
        .css('display', 'none')
        .removeClass('initially-hidden')
);

const numberOfTextColors = 32;

const defaultHexColors = [
    '#ffffff',
    '#20A0D6',
    '#FF784C',
    '#66CC40',
    '#99CCFF',
    '#CCC0FF',
    '#FFFFA0',
    '#808080',
    '#C0C0C0',
    '#2080CC',
    '#FF3810',
    '#00A010',
    '#3E9ADE',
    '#A098FF',
    '#FFCC20',
    '#000000',
    '#84AAFF',
    '#FFFF40',
    '#FF2020',
    '#202040',
    '#E08040',
    '#F0C040',
    '#4080C0',
    '#40C0F0',
    '#80FF80',
    '#C08080',
    '#8080FF',
    '#FF80FF',
    '#00A040',
    '#00E060',
    '#A060E0',
    '#C080FF',
];

function colorCodeToHex(color) {
    try {
        return window.opener.ColorManager.textColor(color) || '#ffffff';
    }
    catch (error) {
        return defaultHexColors[color] || '#ffffff';
    }
}

function range(n) {
    const result = [ ];
    
    for (let i = 0; i < n; i++) {
        result.push(i);
    }
    return result;
}

function setupSwitches() {
    $('.switch').each((_, element) => {
        const configField = $(element).data('config-field');
        const isSkipSave = $(element).data('skip-save');

        const labelText = $(element).text();
        $(element).text('');

        const input = $('<input>');

        input
            .addClass('form-check-input')
            .attr('type', 'checkbox')
            .attr('id', configField)
            .on('change', () => {
                const checked = input.prop('checked');
                const onchange = $(element).data('onchange');

                if (onchange) {
                    window[onchange](checked);
                }
                else if (!isSkipSave) {
                    changeBoolean(configField, checked);
                }
            });

        $(element)
            .append($('<label></label>')
                .addClass('form-check form-switch')
                .append(input)
                .append($('<label></label>')
                    .addClass('form-check-label')
                    .attr('for', configField)
                    .text(labelText)))
    });
}

function setupTextColorPickers() {
    $('.text-color-picker').each((_, element) => {
        const configField = $(element).data('config-field');
        const isSkipSave = $(element).data('skip-save');

        const span = $('<span></span>')
            .addClass('input-group-text')
            .attr('id', configField + 'Span')
            .css({
                'font-size': 'larger',
            })
            .text('A');
        
        const select = $('<select></select>')
            .addClass('input-group-text form-select')
            .attr('id', configField)
            .css('width', '4rem');
        
        select.on('change', () => {
            const value = Number(select.val());
            setTextColor(configField, value);
            
            if (!isSkipSave) {
                config[configField] = value;
                onSave();
            }
        });

        range(numberOfTextColors).forEach((i) => select.append($('<option></option>')
            .val(i)
            .css('background-color', colorCodeToHex(i))
        ));

        $(element)
            .addClass('d-flex')
            .append($('<div></div>')
                    .addClass('input-group')
                    .addClass('me-2')
                    .css('width', 'fit-content')
                    .append(span)
                    .append(select)
                )
                .append($('<button></button>')
                    .addClass('btn btn-outline-secondary')
                    .append($('<i></i>').addClass('bi bi-arrow-counterclockwise'))
                    .on('click', () => {
                        const defaultValue = getTemplate()[configField];
                        setTextColor(configField, defaultValue);

                        if (!isSkipSave) {
                            config[configField] = undefined;
                            onSave();
                        }
                    })
                );
        
        const currentValue = config[configField] || 0;
        select.val(currentValue);
        setTextColor(configField, currentValue);
    });
}

function setTextColor(elementId, textColor) {
    $('#' + elementId + 'Span').css('color', colorCodeToHex(textColor));
}

function setupColorPickers() {
    $('.color-picker').each((_, element) => {
        const configField = $(element).data('config-field');

        const color = $('<input></input>')
            .addClass('form-control form-control-color')
            .addClass('me-2')
            .attr('type', 'color')
            .attr('id', configField);
        
        color.on('change', () => changeColor(configField, color.val()));

        $(element)
            .addClass('d-flex')
            .append(color)
            .append($('<button></button>')
                .addClass('btn btn-outline-secondary')
                .append($('<i></i>').addClass('bi bi-arrow-counterclockwise'))
                .on('click', () => {
                    window[configField].value = getTemplate()[configField];

                    config[configField] = getTemplate()[configField];
                    onSave();
                }
            ));
    });
}

function setup2ColorPickers() {
    $('.2-color-picker').each((_, element) => {
        const configField = $(element).data('config-field');

        const color1 = $('<input></input>')
            .addClass('form-control form-control-color')
            .addClass('me-2')
            .attr('type', 'color')
            .attr('id', configField + '1');

        const color2 = $('<input></input>')
            .addClass('form-control form-control-color')
            .addClass('me-2')
            .attr('type', 'color')
            .attr('id', configField + '2');
        
        color1.on('change', () => changeColor(configField + '1', color1.val()));
        color2.on('change', () => changeColor(configField + '2', color2.val()));  

        $(element)
            .addClass('d-flex')
            .append(color1)
            .append(color2)
            .append($('<button></button>')
                .addClass('btn btn-outline-secondary')
                .append($('<i></i>').addClass('bi bi-arrow-counterclockwise'))
                .on('click', () => {
                    window[configField + '1'].value = getTemplate()[configField + '1'];
                    window[configField + '2'].value = getTemplate()[configField + '2'];

                    config[configField + '1'] = getTemplate()[configField + '1'];
                    config[configField + '2'] = getTemplate()[configField + '2'];
                    onSave();
                }
            ));
    });
}

function changeColor(elementId, color) {
    changeText(elementId, color);
}

function setup9DirButtons() {
    $('.9-dir').each((_, element) => {
        const configField = $(element).data('config-field');
        const noCenter = $(element).hasClass('no-center');

        const button = (iconClass, direction) => $('<button></button>')
            .addClass('btn w-100')
            .attr('id', configField + capitalizeFirstLetter(direction))
            .append($('<i></i>').addClass('bi ' + iconClass))
            .on('click', () => change9Dir(configField + capitalizeFirstLetter(direction)));

        const buttonDiv = (iconClass, direction) => $('<div></div>')
            .addClass('col-4')
            .append(button(iconClass, direction));
        
        const emptyDiv = () => $('<div></div>').addClass('col-4');

        $(element)
            .addClass('row mb-4 g-2')
            .css('width', '10rem')
            .append(buttonDiv('bi-arrow-up-left',       'topLeft'))
            .append(buttonDiv('bi-arrow-up',            'topCenter'))
            .append(buttonDiv('bi-arrow-up-right',      'topRight'))
            .append(buttonDiv('bi-arrow-left',          'middleLeft'))
            .append(noCenter ? emptyDiv() : buttonDiv('bi-fullscreen', 'middleCenter'))
            .append(buttonDiv('bi-arrow-right',         'middleRight'))
            .append(buttonDiv('bi-arrow-down-left',     'bottomLeft'))
            .append(buttonDiv('bi-arrow-down',          'bottomCenter'))
            .append(buttonDiv('bi-arrow-down-right',    'bottomRight'))
        
        const value = [
            config[configField],
            $(element).data('default-value'),
            'topLeft',
        ].find(Boolean);
        
        toggle9DirButtons('#' + configField, value);
    });
}

function setupTextAlignButtons() {
    $('.text-align').each((_, element) => {
        const configField   = $(element).data('config-field');
        const defaultValue  = $(element).data('default-value');
        const currentValue  = config[configField] || defaultValue || 'left';

        const makeButton = (align, iconClass) => $('<button></button>')
            .addClass('btn')
            .attr('type', 'button')
            .attr('id', configField + capitalizeFirstLetter(align))
            .append($('<i></i>').addClass('bi ' + iconClass))
            .on('click', () => changeTextAlign(configField + capitalizeFirstLetter(align)));

        $(element)
            .append($('<div></div>')
                .addClass('btn-group btn-group-lg')
                .append(makeButton('left',      'bi-text-left'))
                .append(makeButton('center',    'bi-text-center'))
                .append(makeButton('right',     'bi-text-right'))
            );
        
        toggleButtons('#' + configField, ['left', 'center', 'right'], currentValue);
    });
}

function setupWindowBackgroundSettings() {
    $('.window-bg-settings').each((_, element) => {
        const configField   = $(element).data('config-field');
        const fileField     = $(element).data('file');
        const folder        = $(element).data('folder');

        const currentValue = config[configField] || 'window';

        const fileInput = $('<input></input>')
            .addClass('form-control')
            .attr('type', 'file')
            .attr('id', fileField);
        
        fileInput.on('change', () => changeFile(fileField, folder, fileInput.val()));

        const fileBox = $('<div></div>')
            .attr('id', fileField + 'Box')
            .append(fileInput)
            .append($('<p></p>')
                .addClass('info mb-0')
                .text('File must be located in your game directory/' + folder)
        );
                
        currentValue == 'image'
            ? fileBox.show()
            : fileBox.hide();

        const select = $('<select></select>')
            .addClass('form-select')
            .attr('id', configField)
            .append($('<option></option>').val('window').text('Window'))
            .append($('<option></option>').val('dimmed').text('Dimmed'))
            .append($('<option></option>').val('image').text('Image'))
            .append($('<option></option>').val('none').text('None'));

        select.on('change', () => {
            const value = select.val();
            
            value == 'image'
                ? fileBox.show()
                : fileBox.hide();

            config[configField] = value;
            onSave();
        });
        
        $(element).addClass('row mb-4')
            .append($('<div></div>')
                .addClass('col')
                .append(select)
            )
            .append($('<div></div>')
                .addClass('col')
                .append(fileBox)
            );
    });
}

function setupPageElements() {
    setupSwitches();
    setupColorPickers();
    setup2ColorPickers();
    setupTextColorPickers();
    setupIconPickers();
    setup9DirButtons();
    setupTextAlignButtons();
    setupWindowBackgroundSettings();
}

function updateSortableTable(
    tHead,
    tBody,
    columnNames,
    list,
    functions,
    emptyMessage,
    moveUpAction,
    moveDownAction,
    editAction,
    deleteAction,
) {
    tHead.empty();
    tBody.empty();

    const allColumnNames = columnNames.slice();
    allColumnNames.push("Actions");

    tHead.append($('<tr></tr>').append(allColumnNames.map(name => $('<th></th>').text(name))));

    list.forEach((item, index) => {
        const row = $('<tr></tr>');

        functions.forEach((f, colIndex) => {
            const cell = f(item, index, colIndex);
            row.append(cell);
        });

        const moveUpButton = $('<button></button>')
            .addClass('btn btn-sm btn-outline-primary me-1')
            .append($('<i></i>').addClass('bi bi-chevron-double-up'))
            .prop('disabled', index == 0)
            .css('visibility', index == 0 ? 'hidden' : 'visible')
            .on('click', () => moveUpAction(index));
        
        const moveDownButton = $('<button></button>')
            .addClass('btn btn-sm btn-outline-primary me-1')
            .append($('<i></i>').addClass('bi bi-chevron-double-down'))
            .prop('disabled', index == list.length - 1)
            .css('visibility', index == list.length - 1 ? 'hidden' : 'visible')
            .on('click', () => moveDownAction(index));
        
        const editButton = $('<button></button>')
            .addClass('btn btn-sm btn-outline-secondary me-1')
            .append($('<i></i>').addClass('bi bi-pencil'))
            .on('click', () => editAction(index));
        
        const deleteButton = $('<button></button>')
            .addClass('btn btn-sm btn-outline-danger')
            .append($('<i></i>').addClass('bi bi-trash'))
            .on('click', () => deleteAction(index));
        
        const actionsTableCell = $('<td></td>')
            .append(moveUpButton)
            .append(moveDownButton)
            .append(editButton)
            .append(deleteButton);
        
        row.append(actionsTableCell);

        tBody.append(row);
    });

    if (!list.length) {
        tBody.append($('<tr></tr>').append($('<td></td>')
            .addClass('p-4 text-center text-muted')
            .attr('colspan', allColumnNames.length)
            .text(emptyMessage)
        ));
    }
}


var config = { };

$(document).ready(() => readFile('uicustom/' + CONFIG_NAME)
    .then((data) => Object.assign(config, data))
    .catch(() => Object.assign(config, getTemplate()))
    .finally(() => {
        setupPageElements();
        syncFormInputs();
        refreshIconPickerPreviews();
    }));

function onQuickTemplate(template) {
    const immune = { };

    Object.keys(config)
        .filter(isImmuneConfigField)
        .forEach(field => {
            immune[field] = config[field];
        });

    config = getTemplate(template);

    Object.keys(immune).forEach(field => {
        config[field] = immune[field];
    });

    syncFormInputs();
    refreshIconPickerPreviews();
    onSave();
}

function onRestoreDefaults() {
    onQuickTemplate(null);
}

function changeText(key, value) {
    config[key] = value !== '' ? value : undefined;
    onSave();
}

function changeNumber(key, value) {
    config[key] = value !== '' ? Number(value) : undefined;
    onSave();
}

function changeBoolean(key, checked) {
    config[key] = checked;
    onSave();
}

function changeFile(key, folder, file) {
    config[key] = userFileToLocalFile(folder, file);
    onSave();
}

function userFileToLocalFile(folder, filepath) {
    return filepath
        ? folder + '/' + filepath.replace(/\\/g, '/').split('/' + folder + '/')[1]
        : null;
}

function changeTextAlign(fullElementId) {
    changeButtonGroup(fullElementId, ['left', 'center', 'right']);
}

function changeVertAlign(fullElementId) {
    changeButtonGroup(fullElementId, ['top', 'middle', 'bottom']);
}

function change9Dir(fullElementId) {  
    const directions = [
        'topLeft',      'topCenter',        'topRight',
        'middleLeft',   'middleCenter',     'middleRight',
        'bottomLeft',   'bottomCenter',     'bottomRight',
    ];

    changeButtonGroup(fullElementId, directions);
}

function changeButtonGroup(fullElementId, buttons) {
    const activeButton = buttons.find(item => fullElementId.toLowerCase().includes(item.toLowerCase()));

    if (activeButton) {
        const key = fullElementId.slice(0, fullElementId.length - activeButton.length);
        config[key] = activeButton;

        toggleButtons('#' + key, buttons, activeButton);
        onSave();
    }
}

function toggle9DirButtons(elementId, selectedValue) {
    toggleButtons(
        elementId,
        [
            'topLeft',      'topCenter',        'topRight',
            'middleLeft',   'middleCenter',     'middleRight',
            'bottomLeft',   'bottomCenter',     'bottomRight',
        ],
        selectedValue,
    );
}

function toggleButtons(elementId, values, selectedValue) {
    values.forEach((value) => toggleButton(
        elementId + capitalizeFirstLetter(value),
        value == selectedValue,
    ));
}

function toggleButton(elementId, b) {
    b
        ? $(elementId).removeClass('btn-outline-primary').addClass('btn-primary')
        : $(elementId).removeClass('btn-primary').addClass('btn-outline-primary');
}

function toggleVisibility(elementId, b) {
    b
        ? $(elementId).show()
        : $(elementId).hide();
}

function toggleEnable(elementId, b) {
    $(elementId).prop('disabled', !b);
}

function onResetGaugeColor(type) {
    window['gaugeColor' + type + '1'].value = getTemplate()['gaugeColor' + type + '1'];
    window['gaugeColor' + type + '2'].value = getTemplate()['gaugeColor' + type + '2'];

    config['gaugeColor' + type + '1'] = getTemplate()['gaugeColor' + type + '1'];
    config['gaugeColor' + type + '2'] = getTemplate()['gaugeColor' + type + '2'];
    onSave();
}

function onResetGaugeBackgroundColor(type) {
    window['gaugeBackgroundColor' + type].value = getTemplate()['gaugeBackgroundColor' + type];

    config['gaugeBackgroundColor' + type] = getTemplate()['gaugeBackgroundColor' + type];
    onSave();
}

function onOverrideHelpWindowChange(checked) {
    toggleVisibility('#helpWindowFileBox', checked);
    
    config.overrideHelpWindowSkin = checked;
    onSave();
}

function syncLayout2Fields(windowTypes) {
    windowTypes.forEach(windowType => {
        const key = `override${capitalizeFirstLetter(windowType)}Rectangle`;
        window[key].checked = config[key];

        toggleVisibility(`#${windowType}RectangleByValuesBox`, config[key]);

        ['x', 'y', 'width', 'height']
            .map(prop => `${windowType}Rectangle_${prop}`)
            .forEach(key => window[key].value = config[key]);
    });
}

function onAutoAdjustVisibleActorsChange(checked) {
    toggleVisibility('#visibleActorsWave', checked);
    toggleVisibility('#visibleActorsMax', checked);
    
    config.autoAdjustVisibleActors = checked;
    onSave();
}

function onOverrideCommandRectangleChange(checked) {
    toggleVisibility('#commandRectangleByValuesBox', checked);
    
    config.overrideCommandRectangle = checked;
    onSave();
}

function onOverrideStatusRectangleChange(checked) {
    toggleVisibility('#statusRectangleByValuesBox', checked);

    config.overrideStatusRectangle = checked;
    onSave();
}

function onOverrideGoldRectangleChange(checked) {
    toggleVisibility('#goldRectangleByValuesBox', checked);

    config.overrideGoldRectangle = checked;
    onSave();
}

function onOverrideSlotRectangleChange(checked) {
    toggleVisibility('#slotWindowRectangleByValuesBox', checked);

    config.overrideSlotWindowRectangle = checked;
    onSave();
}

function onOverrideInventoryRectangleChange(checked) {
    toggleVisibility('#inventoryRectangleByValuesBox', checked);

    config.overrideInventoryRectangle = checked;
    onSave();
}

function onOverrideHelpRectangleChange(checked) {
    toggleVisibility('#helpRectangleByValuesBox', checked);

    config.overrideHelpRectangle = checked;
    onSave();
}

function onOverrideCategoryRectangleChange(checked) {
    toggleVisibility('#categoryRectangleByValuesBox', checked);

    config.overrideCategoryRectangle = checked;
    onSave();
}

function onOverrideItemListRectangleChange(checked) {
    toggleVisibility('#itemListRectangleByValuesBox', checked);

    config.overrideItemListRectangle = checked;
    onSave();
}

function onOverrideItemDetailRectangleChange(checked) {
    toggleVisibility('#itemDetailRectangleByValuesBox', checked);

    config.overrideItemDetailRectangle = checked;
    onSave();
}

function onOverrideSkillTypesRectangleChange(checked) {
    toggleVisibility('#skillTypesRectangleByValuesBox', checked);

    config.overrideSkillTypesRectangle = checked;
    onSave();
}

function onOverrideSkillListRectangleChange(checked) {
    toggleVisibility('#skillListRectangleByValuesBox', checked);

    config.overrideSkillListRectangle = checked;
    onSave();
}

function onOverrideTitleRectangleChange(checked) {
    toggleVisibility('#titleRectangleByValuesBox', checked);

    config.overrideTitleRectangle = checked;
    onSave();
}

function onOverrideContentRectangleChange(checked) {
    toggleVisibility('#contentRectangleByValuesBox', checked);

    config.overrideContentRectangle = checked;
    onSave();
}

function onLayout2ValueChange(windowType, prop, value) {
    const key = `${windowType}Rectangle_${prop}`;

    changeNumber(key, value);
}

function gamePluginsList() {
    return window.opener ? window.opener.PluginManager._scripts : [ ];
}

function hasPlugin(pluginName) {
    return gamePluginsList().includes(pluginName);
}

function isPluginCollectionBelowMK(pluginNamePrefix) {
    const plugins           = gamePluginsList();
    const pluginIndex       = plugins.findIndex(script => script.includes(pluginNamePrefix));
    const thisPluginIndex   = plugins.findIndex(script => script.includes('MK_UICustomizer'));

    return pluginIndex > thisPluginIndex;
}

function checkPluginParameter(pluginName, parameterName, valueToCheck) {
    if (window.opener) {
        const params = window.opener.PluginManager.parameters(pluginName);
        return params && params[parameterName] === valueToCheck;
    }
    return false;
}

function readFile(filePath) {
    return new Promise((resolve, reject) => {
        try {
            const fs = require('fs');
            fs.readFile(filePath, 'utf-8', (_, data) => {
                if (data) {
                    resolve(JSON.parse(data));
                } else {
                    reject();
                }
            });
        }
        catch (error) {
            reject(error);
        }
    });
}

function writeFile(filepath, data) {
    const fs = require('fs');
    fs.writeFile(
        filepath,
        JSON.stringify(data, null, 2),
        'utf-8',
        (error) => error && alert("Something went wrong: " + error),
    );
}

function fetchLatestVersion(currentVersion, extractVersionFromServer) {
    $.ajax({
        url:        'http://downloads.aerosys.blog/plugins/news.json',
        type:       'GET',
        dataType:   'json',
        timeout:    5000,
        cache:      false,
        error:      () => ({ }),
        success:    (data) => {
            const data2 = RpgMakerName == 'MZ' ? data.mz : data.mv;
            const versionOnServer = extractVersionFromServer(data2);

            if (versionOnServer && !compareVersions(currentVersion, versionOnServer)) {
                $('#newVersionAvailableBox').show();
                $('#newVersionAvailableMessage').text("A new version of this plugin is available: " + versionOnServer);
            }
        },
    });
}

function capitalizeFirstLetter(string) {
    if (!string || string.length === 0) return string;
    return string.charAt(0).toUpperCase() + string.slice(1);
}

function compareVersions(a, b) {
    if (typeof a !== 'string') return false;
    if (typeof b !== 'string') return false;

    for (let i = 0; i < 3; i++) {
        if (Number(a.split('.')[i]) > Number(b.split('.')[i])) {
            return true;
        }
        if (Number(a.split('.')[i]) < Number(b.split('.')[i])) {
            return false;
        }
    }
    return true;
}

let currentTargetInput          = null;
let currentIconPickerPreview    = null;
let currentIconPickerConfigKey  = null;
let currentIconPickerOnChange   = null;
let selectedIconIndex           = null;

const ICONS_PER_ROW = 16;

const ICON_SIZE = window && window.opener && window.opener.$dataSystem && window.opener.$dataSystem.iconSize
    ? window.opener.$dataSystem.iconSize
    : 32;


function initIconPicker() {
    const sprite = document.getElementById('iconSprite');

    sprite.addEventListener('click', e => {
        selectedIconIndex = getHighlightedIconIndex(e);
        moveIconHighlight(selectedIconIndex);
    });

    sprite.addEventListener('dblclick', e => {
        const iconIndex = getHighlightedIconIndex(e);

        if (typeof iconIndex == 'number') {
            selectedIconIndex = iconIndex;
            onChooseIconConfirm();
        }
    });
}

$(document).ready(() => initIconPicker());

function getHighlightedIconIndex(e) {
    const rect  = e.target.getBoundingClientRect();
    const x     = e.clientX - rect.left;
    const y     = e.clientY - rect.top;
    const col   = Math.floor(x / ICON_SIZE);
    const row   = Math.floor(y / ICON_SIZE);
    
    return row * ICONS_PER_ROW + col;
}

function moveIconHighlight(index) {
    const highlight = document.getElementById('highlight');
    
    highlight.style.left        = ((index % ICONS_PER_ROW) * ICON_SIZE) + "px";
    highlight.style.top         = (Math.floor(index / ICONS_PER_ROW) * ICON_SIZE) + "px";
    highlight.style.display     = "block";
}

function renderIconPreview(previewElement, iconIndex) {
    if (!previewElement) {
        return;
    }

    const safeIconIndex = Number.isFinite(Number(iconIndex)) ? Number(iconIndex) : 0;
    const col = safeIconIndex % ICONS_PER_ROW;
    const row = Math.floor(safeIconIndex / ICONS_PER_ROW);

    const iconSprite = document.getElementById('iconSprite');
    const iconSetSrc = iconSprite && iconSprite.getAttribute('src')
        ? iconSprite.getAttribute('src')
        : '../img/system/IconSet.png';

    $(previewElement)
        .attr('title', String(safeIconIndex))
        .css('background-image', `url("${iconSetSrc}")`)
        .css('background-repeat', 'no-repeat')
        .css('background-size', 'auto')
        .css('background-position', `${-col * ICON_SIZE}px ${-row * ICON_SIZE}px`);
}

function refreshIconPickerPreviews() {
    $('.icon-picker').each((_, element) => {
        const input     = $(element).find('.icon-picker-value')[0];
        const preview   = $(element).find('.icon-picker-preview')[0];
        const value     = Number(input ? input.value : 0) || 0;

        renderIconPreview(preview, value);
    });
}

function onChooseIconConfirm() {
    closeIconPicker();

    if (currentTargetInput) {
        currentTargetInput.value = selectedIconIndex;
    }

    renderIconPreview(currentIconPickerPreview, selectedIconIndex);

    if (currentIconPickerConfigKey && currentTargetInput) {
        changeNumber(currentIconPickerConfigKey, selectedIconIndex);
    }

    if (typeof currentIconPickerOnChange === 'string' && currentIconPickerOnChange.trim().length) {
        const callback = window[currentIconPickerOnChange];

        if (typeof callback === 'function') {
            callback(selectedIconIndex, currentTargetInput, currentIconPickerConfigKey);
        }
    }
    if (typeof currentIconPickerOnChange === 'function') {
        currentIconPickerOnChange(selectedIconIndex, currentTargetInput, currentIconPickerConfigKey);
    }
}

function closeIconPicker() {
    $('#iconPickerModal').modal('hide');
}

function buildIconPicker(id, label, onchange, isLargeLabel) {
    const labelSpan = $('<span></span>')
        .addClass('input-group-text')
        .addClass('d-flex align-items-center')
        .addClass(isLargeLabel ? 'justify-content-end' : ' justify-content-center')
        .css('width', isLargeLabel ? '8rem' : '4rem')
        .text(label);
    
    const input = $('<input>')
        .addClass('icon-picker-value')
        .attr('type', 'hidden');

    if (id) {
        input.attr('id', id);
    }

    const preview = $('<span></span>')
        .addClass('icon-picker-preview')
        .css('display', 'inline-block')
        .css('width', `${ICON_SIZE}px`)
        .css('height', `${ICON_SIZE}px`)
        .css('image-rendering', 'pixelated');

    const previewWrapper = $('<span></span>')
        .addClass('input-group-text icon-picker-preview-wrap')
        .append(preview);

    const initialValueFromConfig = id ? config[id] : undefined;
    const initialValue = Number.isFinite(Number(initialValueFromConfig)) ? Number(initialValueFromConfig) : 0;
    
    input.val(initialValue);
    renderIconPreview(preview[0], initialValue);
    
    const button = $('<button></button>')
        .addClass('btn btn-outline-secondary')
        .append($('<i></i>').addClass('bi bi-box-arrow-up-right'))
        .on('click', () => {
            currentTargetInput = input[0];
            currentIconPickerPreview = preview[0];
            currentIconPickerConfigKey = id;
            currentIconPickerOnChange = onchange;

            const selectedFromConfig = currentIconPickerConfigKey
                ? config[currentIconPickerConfigKey]
                : undefined;

            if (typeof selectedFromConfig === 'number') {
                selectedIconIndex = selectedFromConfig;
            }
            else {
                const selectedFromInput = Number(input.val());
                selectedIconIndex = Number.isFinite(selectedFromInput) ? selectedFromInput : 0;
            }

            moveIconHighlight(selectedIconIndex);

            $('#iconPickerModal').modal('show');
        });
    
    return $('<div></div>')
        .addClass('input-group')
        .css('width', isLargeLabel ? '16rem' : '12rem')
        .append(label && labelSpan)
        .append(previewWrapper)
        .append(input)
        .append(button);
}

function setupIconPickers() {
    $('.icon-picker').each((_, element) => {
        const id            = $(element).data('config-field');
        const onchange      = $(element).data('onchange');
        const label         = $(element).data('label');
        const isLargeLabel  = $(element).hasClass('large-label');

        $(element).append(buildIconPicker(id, label, onchange, isLargeLabel));
    });
}

let suppressEscapeUntilKeyup = false;

document.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape') {
        return;
    }

    if (suppressEscapeUntilKeyup) {
        event.preventDefault();
        event.stopImmediatePropagation();
        return;
    }

    const topLevelModal = $('.modal.toplevel-modal.show').last();

    if (!topLevelModal.length) {
        return;
    }

    suppressEscapeUntilKeyup = true;
    event.preventDefault();
    event.stopImmediatePropagation();
    topLevelModal.modal('hide');
}, true);

document.addEventListener('keyup', (event) => {
    if (event.key === 'Escape') {
        suppressEscapeUntilKeyup = false;
    }
}, true);
