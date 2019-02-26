#!/bin/bash
####################################################################################
#
#  (c) 2017 SAP SE
#
#  This bash script calls xsuaa REST endpoints for JWT trust and then create a SQL
#  script which you can execute via hdbsql or HANA studio
#
#####################################################################################
# for debug reasons
#set -x -v
#show options for this script
TRUST_VALUE=
JSON_VALUE=
UAA_VALUE=
JWT_ISSUER=
ZONE_VALUE=
function show_options
{
    echo "Options: "
    echo " -a:      xsuaa base URI [default: https://localhost:30032/uaa-security]"
    echo " -i:      SQL template in [default: xsuaa_template.sql]"
    echo " -q:      SQL file created [default: xs_appuser.sql]"
    echo " -n:      HANA host name:port [default: EMPTY, no hdbsql used]"
    echo " -u:      HANA system user name [default: system]"
    echo " -p:      HANA system user password"
}
# show help
function show_help
{
    echo ""
    echo "Usage: $0 <options>"
    echo ""
    echo "This bash script calls xsuaa REST endpoints for JWT trust and creates a SQL script for manual execution"
    echo ""
    show_options
    exit $1
}
#######
# this is the core function.
#######
# REST call for Trust Setup
function get_trust_value
{
    JSON_VALUE=`curl -sk  -H "Accept: application/json" -H "Content-Type: application/json" $uaa_url/sap/trust/jwt`
}
function get_trust_parameter
{
    TRUST_VALUE=`echo $JSON_VALUE  | sed -e 's/^.*"'$1'":"\([^"]*\)".*$/\1/'`
    if [ "$TRUST_VALUE" == "" ] || [ "${TRUST_VALUE:0:1}" == "{" ] ; then
       echo ""
       echo "###############################################"
       echo "Error"
       echo "Parameter $1 could not be found in metadata"
       echo ""
       echo "$JSON_VALUE"
       echo ""
       echo "Please check if $uaa_url is a XSUAA, but not a "
       echo "CloudFoundry UAA, which is not supported."
       echo ""
       echo "Create a customer ticket on component of SAP note 2470084."
       echo ""
       echo "###############################################"
       echo ""
       exit 1
    fi
}

function check_uaa
{
    UAA_VALUE=`curl -sk -m 10  -H "Accept: application/json" -H "Content-Type: application/json" $uaa_url/login`
}

function get_zone_value
{
    ZONE_VALUE=`echo $UAA_VALUE  | sed -e 's/^.*"zone_name":"\([^"]*\)".*$/\1/'`
    ZONE_VALUE=`echo $ZONE_VALUE | tr '.-' '_' | tr '[:lower:]' '[:upper:]'`
}

while getopts ":a:q:n:u:p:i:" opt; do
    case $opt in
    a)
        uaa_url=$OPTARG
        ;;
    q)
        out_file=$OPTARG
        ;;
    i)
        in_file=$OPTARG
        ;;
    n)
        hana_host=$OPTARG
        ;;
    u)
        hana_user=$OPTARG
        ;;
    p)
        hana_pwd=$OPTARG
        ;;
    \?)
        echo "Error: Invalid option -$OPTARG" >&2
        show_options
        exit 1
        ;;
    :)
        echo "Error: The option -$OPTARG requires an argument." >&2
        show_options
        exit 1
        ;;
    esac
done

if [ "$#" -eq 0 ]; then
  show_help 0
fi
if [ "$uaa_url" == "" ]; then
    uaa_url="https://localhost:30032/uaa-security"
fi
if [ "$out_file" == "" ]; then
    out_file="xs_appuser.sql"
fi
if [ "$in_file" == "" ]; then
    in_file="xsuaa_template.sql"
fi
if [ "$hana_user" == "" ]; then
    hana_user="SYSTEM"
fi
if [ ! -f "$in_file" ]; then
    echo "File $in_file not found"
    exit 0
fi
if [ "$hana_host" != "" ]; then
if [[ -z "$hana_pwd" ]]; then
    echo "Error: Sorry, need HANA password "
    show_options
    exit 0
fi
echo "check for program hdbsql ..."
test=`hdbsql -q`
if [ $? -ne 0 ]; then
    echo "Need hdbsql on machine. Does not find it"
    exit 0
fi
run_hdbsql=`which hdbsql`
if [ ! -f "$run_hdbsql" ]; then
    echo "Need $run_hdbsql on machine. Does not find it"
    exit 0
fi
echo "found it in $run_hdbsql"
fi

#### start now
check_uaa
if [ "$UAA_VALUE" == "" ]; then
    echo ""
    echo "###############################################"
    echo "Error"
    echo "The response from request to base "
    echo "URI $uaa_url/login was empty"
    echo "Check your parameter -a and/or your XSUAA on $uaa_url"
    echo ""
    echo "###############################################"
    echo ""
    show_help 1
fi

# get zone_name from login info
get_zone_value
if [ "$ZONE_VALUE" == "" ]; then
    echo ""
    echo "###############################################"
    echo "Error"
    echo "The response from request to base "
    echo "URI $uaa_url/login does not return a zone information zone_name"
    echo "Check your parameter -a and/or your XSUAA on $uaa_url"
    echo ""
    echo "###############################################"
    echo ""
    show_help 1
else
  if [ "$ZONE_VALUE" == "UAA" ]; then
    ZONE_VALUE="JWTPROVIDER"
  else
    ZONE_VALUE="JWTPROVIDER_$ZONE_VALUE"
  fi
fi

# get json metadata for trust and keep it in JSON_VALUE
get_trust_value
if [ "$JSON_VALUE" == "" ]; then
    echo ""
    echo "###############################################"
    echo "Error"
    echo "The answer on base URI $uaa_url/sap/trust/jwt was empty"
    echo ""
    echo "Please check if $uaa_url is a XSUAA, but not a "
    echo "CloudFoundry UAA, which is not supported, see"
    echo "SAP note 2470084."
    echo ""
    echo "###############################################"
    echo ""
    exit 1
fi
get_trust_parameter "issuer"
export JWT_ISSUER=$TRUST_VALUE

get_trust_parameter "subject_dn"
JWT_SUBJECT_DN=$TRUST_VALUE

get_trust_parameter "purpose"
JWT_PURPOSE=$TRUST_VALUE

get_trust_parameter "certificate"
JWT_CERTIFICATE=$TRUST_VALUE
echo ""
echo "Create SQL file: $out_file from SQL template $in_file"
cp -f "$in_file" "$out_file"

if [ "$(uname)" == "Darwin" ]; then
  sed -i '' "s|\$ISSUER_JWT|$JWT_ISSUER|g" "$out_file"
  sed -i '' "s|\$SUBJECT_DN|$JWT_SUBJECT_DN|g" "$out_file"
  sed -i '' "s|\$PURPOSE|$JWT_PURPOSE|g" "$out_file"
  sed -i '' "s|\$CERTIFICATE_PEM|$JWT_CERTIFICATE|g" "$out_file"
  sed -i '' "s|http://localhost:8080/uaa/oauth/token|$JWT_ISSUER|g" "$out_file"
  sed -i '' "s|JWTPROVIDER|$ZONE_VALUE|g" "$out_file"
else
  sed -i "s|\$ISSUER_JWT|$JWT_ISSUER|g" "$out_file"
  sed -i "s|\$SUBJECT_DN|$JWT_SUBJECT_DN|g" "$out_file"
  sed -i "s|\$PURPOSE|$JWT_PURPOSE|g" "$out_file"
  sed -i "s|\$CERTIFICATE_PEM|$JWT_CERTIFICATE|g" "$out_file"
  sed -i "s|http://localhost:8080/uaa/oauth/token|$JWT_ISSUER|g" "$out_file"
  sed -i "s|JWTPROVIDER|$ZONE_VALUE|g" "$out_file"
fi
echo "Replaced variables in template"
if [ "$hana_host" != "" ]; then
  echo "Execute hdbsql now..."
  $run_hdbsql -n $hana_host -j -c "--" -separatorownline -u $hana_user -p $hana_pwd -I "$out_file"
else
  echo "SQL script in $PWD/$out_file ready to be executed via hdbsql or withint HANA studio"
fi
echo ""
exit 0

