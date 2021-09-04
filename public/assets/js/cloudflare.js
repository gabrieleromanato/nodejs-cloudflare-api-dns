"use strict";

(function( $ ) {

    var dnsRecords = 'A,AAAA,CNAME,HTTPS,TXT,SRV,LOC,MX,NS,SPF,CERT,DNSKEY,DS,NAPTR,SMIMEA,SSHFP,SVCB,TLSA,URI'.split(',');
    var $loader = $( "#loader" );
    var $dnsZones = $( "#dns-zones" );
    var currentZoneID = "";

    function isMobile() {
        return /mobile/gi.test( navigator.userAgent );
    }

    function SelectBox( records ) {
        var html = '<select name="type">';
        records.forEach(function( item, index ){
            var selected = index === 0 ? ' selected' : '';
            html += '<option value="' + item + '"' + selected + '>' + item + '</option>';
        });
        html += '</select>';

        return html;
    }

    function Modal() {
        var modal = document.createElement('div');
        modal.id = "dns-record-modal";
        modal.className = "modal";

        var html = '<a href="#' + modal.id + '" class="modal-close">&times;</a>';
        html += '<form id="dns-record-add-form" action="" method="post">' +
            '<div>' + SelectBox( dnsRecords ) + '</div>' +
            '<div>' + '<input type="text" name="name" placeholder="Name">' + '</div>' +
            '<div><textarea name="content" placeholder="Content"></textarea></div>' +
            '<div>' + '<input type="text" name="ttl" placeholder="TTL">' + '</div>' +
            '<div>' + '<input type="text" name="priority" placeholder="Priority">' + '</div>' +
            '<div><button type="submit" class="button dns-record-add-btn">Add</button></div>' +
            '</form>';
        modal.innerHTML = html;

        document.body.appendChild( modal );
    }

    function getDNSZoneRecords( element, id ) {
        $loader.fadeIn();
        $.post( "/api/zone-records", { id: id }, function( res ) {
            $loader.fadeOut();
            displayDNSRecords( element, res.result );
        });

    }

    function displayDNSRecords( element, records ) {
        if( Array.isArray( records ) && records.length > 0 ) {
            let html = '';
            records.forEach(function( record ) {
                if( isMobile() ) {
                    html += `<div class="dns-zone-row"><div class="dns-zone-record">${record.name}</div><div class="dns-zone-record-content">${record.content}</div><div class="dns-zone-record-type">${record.type}</div><div class="dns-zone-record-delete"><a href="#" class="delete-record" data-id="${record.id}">&times;</a></div></div>`;
                } else {
                    html += `<tr class="dns-zone-row"><td class="dns-zone-record">${record.name}</td><td class="dns-zone-record-content">${record.content}</td><td class="dns-zone-record-type">${record.type}</td><td class="dns-zone-record-delete"><a href="#" class="delete-record" data-id="${record.id}">&times;</a></td></tr>`;
                }
            });

            element.parent().next().html( html );
        }
    }

    function listeners() {
        $( document ).on( "click", ".dns-zone-detail", function( e ) {
           e.preventDefault();
           var $a = $( this );
            currentZoneID = $a.data( "id" );
            getDNSZoneRecords( $a, $a.data( "id" ) );
        });

        $( document ).on( "click", ".modal-close", function( e ) {
            e.preventDefault();
            $( "body" ).removeClass( "overlay" );
            $( this ).parent().fadeOut();
        });

        $( document ).on( "click", ".dns-zone-add", function( e ) {
           e.preventDefault();
            var $a = $( this );
            currentZoneID = $a.data( "id" );
            $( "body" ).addClass( "overlay" );
            $( "#dns-record-modal" ).fadeIn();
        });

        $( document ).on( "submit", "#dns-record-add-form", function( e ) {
           e.preventDefault();
           var $form = $( this );
           var valid = true;

           $form.find( "input, select, textarea" ).each(function() {
                if( $( this ).val().length === 0 ) {
                    valid = false;
                }
           });
           if( valid ) {
               var data = "id=" + currentZoneID + "&" + $form.serialize();
               addDNSRecord( data );
           }
        });

        $( document ).on( "click", ".delete-record", function( e ) {
            e.preventDefault();
            var $a = $( this );
            var id = $a.data( "id" );
            deleteDNSRecord( $a, id );
        });
    }

    function deleteDNSRecord( element, id ) {
        if( confirm( 'Do you really want to delete this record?' ) ) {
            $loader.fadeIn();
            var data = {
                zone_id: currentZoneID,
                record_id: id
            };
            $.post( "/api/delete-record", data, function( res ) {
                $loader.fadeOut();
                if( res.result && res.result.id === id ) {
                    element.parents( ".dns-zone-row" ).remove();
                }
            });
        }
    }

    function addDNSRecord( data ) {
        $loader.fadeIn();
        $( "#dns-record-modal" ).fadeOut();
        $( "body" ).removeClass( "overlay" );
        $.post( "/api/add-record", data, function( res ) {
            $loader.fadeOut();
            if( res.success ) {
                var record = res.result;
                var html = '';
                if( isMobile() ) {
                    html += `<div class="dns-zone-row"><div class="dns-zone-record">${record.name}</div><div class="dns-zone-record-content">${record.content}</div><div class="dns-zone-record-type">${record.type}</div><div class="dns-zone-record-delete"><a href="#" class="delete-record" data-id="${record.id}">&times;</a></div></div>`;
                } else {
                    html += `<tr class="dns-zone-row"><td class="dns-zone-record">${record.name}</td><td class="dns-zone-record-content">${record.content}</td><td class="dns-zone-record-type">${record.type}</td><td class="dns-zone-record-delete"><a href="#" class="delete-record" data-id="${record.id}">&times;</a></td></tr>`;
                }
                $( ".dns-zone-details" ).prepend( html );
            } else {
                console.log( res );
            }
        });
    }

    function displayDNSZones( data ) {
        if( Array.isArray( data ) && data.length > 0 ) {
            let html = '';
            data.forEach(function( datum ) {
                html += '<div class="dns-zone">';
                html += '<header><h2>' + datum.name + '</h2></header>';
                html += '<p><button type="button" data-id="' + datum.id + '" class="button dns-zone-detail">Get details</button> <a href="#" class="dns-zone-add" data-id="' + datum.id + '">Add new record</a></p>';
                html += isMobile() ? '<div class="dns-zone-details"></div>' : '<table class="dns-zone-details"></table>';
                html += '</div>';
            });

            $dnsZones.html( html );
        }
    }

    function getDNSZones() {
        $.getJSON( "/api/dns-zones", function( res ) {
            $loader.fadeOut();
            displayDNSZones( res.result );
        });
    }

    $(function() {
        listeners();
        Modal();
        getDNSZones();
    });

})( jQuery );