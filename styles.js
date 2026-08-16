import { StyleSheet } from 'react-native';
import { heightPercentageToDP as hp, widthPercentageToDP as wp } from 'react-native-responsive-screen';

const main_color = '#0F4F4F';


const styles = StyleSheet.create({

  Main_BG : {
    backgroundColor : main_color,
    color : 'white',
  },

  Main_Text:{
    color: main_color,
  } ,

  TopContainer: {
    backgroundColor: main_color,
    width: wp('100%'),
    height: hp('35%'),
    borderBottomLeftRadius: 35,
    borderBottomRightRadius: 35,
  },
  LogoText: {
    color: 'white',
    fontWeight: '700',
    fontSize: hp(5),
    textAlign: 'center',
    paddingTop: hp('16%'),
  },
  SloganText: {
    textAlign: 'center',
    fontSize: hp(3),
    fontWeight: '700',
    color: 'white',
  },
  signInHeader: {
    textAlign: 'center',
    fontSize: hp(3.5),
    color: 'black',
    fontWeight: '700',
    margin: wp('5%'),
  },
  LabelText: {
    textAlign: 'left',
    marginLeft: wp('7%'),
    marginTop: hp('2%'),
    fontWeight: '500',
    fontSize: 20,
    color: 'plum',
  },
  Input: {
    padding: wp('3%'), // Reduced for better alignment with fontSize
    borderWidth: 1,
    borderColor: '#aaa',
    borderRadius: 20,
    marginLeft: wp('5%'),
    marginRight: wp('5%'),
    marginTop: wp('2%'),
    marginBottom: wp('5%'),
    width: wp('90%'),
    fontSize: 20,
  },
  SignInButton: {
    alignSelf: 'center',
    backgroundColor: 'plum',
    width: wp('50%'),
    padding: wp('4%'),
    borderRadius: 10,
    borderColor: '#aaa',
    marginTop: wp('1%'),
  },
  SignInButtonText: {
    textAlign: 'center',
    fontWeight: '700',
    fontSize: 17,
    color: 'white',
  },
  SignUpPrompt: {
    textAlign: 'center',
    margin: wp('4%'),
    color: '#aaa', // Fixed invalid hex
    fontWeight: '300',
  },
});

export default styles;